<?php

namespace App\Services;

use Exception;
use App\Models\User;
use App\Models\Entry;
use App\Models\Output;
use App\Models\Parish;
use App\Enums\TypeActivity;
use App\Events\NewActivity;
use App\Models\Municipality;
use App\Models\Organization;
use App\Models\UserDeleteds;
use App\Services\ApiService;
use App\Models\HierarchyEntity;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Auth;
use App\Exceptions\GeneralExceptions;
use App\Models\EntryGeneral;
use App\Models\OutputGeneral;

class OrganizationService extends ApiService
{

    protected $model;
    protected $snakeCaseMap = [

    'authorityFullname' =>'authority_fullname',
    'authorityCi' => 'authority_ci',
    'municipalityId' => 'municipality_id',
    'parishId' => 'parish_id',
    ];



    public function getData()
    {
         $organizations = Organization::with('municipality','parish')
         ->when(request()->input('municipality'),function ($query, $param) {

            if(isset($param['id'])){

                $municipalityIDs = $param['id'];
                $municipalities = $this->parseQuery($municipalityIDs);

                $query->whereHas('municipality', function($query) use ($municipalities) {

                    $query->where('id', $municipalities[0]);
                    if (count($municipalities) > 1) {
                        array_shift($municipalities);
                        foreach ($municipalities as $municipality) {
                            $query->orWhere('id', $municipality);
                        }
                    }

                });
            }
        })
        ->when(request()->input('search'), function ($query, $param) {

            if (!isset($param['all'])) return 0;

                $search = $param['all'];
                $string = $this->generateString($search);
                $query->where('search', 'ILIKE', $string);
        })
        ->when(request()->input('orderBy'), function($query, $param) {
            $orderDirection = (request()->input('orderDirection') == 'asc' || request()->input('orderDirection') == 'desc')
                ? request()->input('orderDirection')
                : 'desc';

            switch ($param) {
                case 'name':
                    $query->orderBy('name', $orderDirection);
                    break;
            }
        })
        ->unless(request()->input('orderBy'), function($query) {
            $query->orderBy('id', 'desc');
        })
        ->paginate(request()->input('rowsPerPage'), ['*'], 'page', request()->input('page'));

        return $organizations;

    }

    public function create($dataToCreateOrganization)
    {

        return DB::transaction(function () use ($dataToCreateOrganization){

            try {

                $municipalityName = null;
                $parishName = null;

                if(isset($dataToCreateOrganization['municipality_id']))
                    $municipalityName = Municipality::where('id',$dataToCreateOrganization['municipality_id'])->first()->name;

                if(isset($dataToCreateOrganization['parish_id']))
                    $parishName = Parish::where('id',$dataToCreateOrganization['parish_id'])->first()->name;

                $dataToCreateOrganization = $this->transformUpperCase($dataToCreateOrganization);
                $dataToCreateOrganization['search'] = $this->generateSearch($dataToCreateOrganization,$municipalityName,$parishName);
                $dataToCreateOrganization['code'] = 'nocode';

                $newOrganization = Organization::create($dataToCreateOrganization);

                $userID = auth()->user()->id;
                NewActivity::dispatch($userID, TypeActivity::CREAR_ORGANIZACION->value, $newOrganization->id);


                return ['message' => 'Creado Exitosamente', 'model' => $newOrganization];

            } catch (Exception $e) {

                Log::error('OrganizationService -  Error al crear organizacion: '. $e->getMessage(), [
                    'data' => $dataToCreateOrganization,
                    'trace' => $e->getTraceAsString()
                ]);

                throw $e;
            }


        });

    }

    public function update($dataToUpdateOrganization,$organization)
    {

        return DB::transaction(function () use($dataToUpdateOrganization, $organization){

            try{

                $municipalityName = null;
                $parishName = null;

                if(isset($dataToUpdateOrganization['municipality_id']))
                    $municipalityName = Municipality::where('id',$dataToUpdateOrganization['municipality_id'])->first()->name;

                if(isset($dataToUpdateOrganization['parish_id']))
                    $parishName = Parish::where('id',$dataToUpdateOrganization['parish_id'])->first()->name;

                $dataToUpdateOrganization = $this->transformUpperCase($dataToUpdateOrganization);
                $dataToUpdateOrganization['search'] = $this->generateSearch($dataToUpdateOrganization,$municipalityName,$parishName);
                $dataToUpdateOrganization['code'] = 'nocode';

                $organization->fill($dataToUpdateOrganization);
                $organization->save();

                $userID = auth()->user()->id;
                NewActivity::dispatch($userID, TypeActivity::ACTUALIZAR_ORGANIZACION->value, $organization->id);


                return ['message' => 'Actualizado Exitosamente'];


            }catch(Exception $e){

                Log::error('OrganizationService -  Error al actualizar organizacion: '. $e->getMessage(), [
                    'data' => $dataToUpdateOrganization,
                    'trace' => $e->getTraceAsString()
                ]);

                throw $e;
            }

        });


    }

    public function delete($organization)
    {

        return DB::transaction(function() use ($organization) {
            try {

                $entry = EntryGeneral::where('organization_id',$organization->id)->first();
                $output = OutputGeneral::where('organization_id',$organization->id)->first();

                if(isset($entry->id))
                    throw new Exception('Existe una entrada con esta organizacion no puede ser eliminado',406);

                if(isset($output->id))
                    throw new Exception('Existe una salida con esta organizacion no puede ser eliminado',406);

                $userID = auth()->user()->id;
                NewActivity::dispatch($userID, 6, $organization->id);
                $organization->delete();

                return ['message' => 'Eliminado con exito'];

            } catch (Exception $e) {

                Log::error('OrganizationService -  Error al eliminar organizacion: '. $e->getMessage(), [
                    'data' => $organization,
                    'trace' => $e->getTraceAsString()
                ]);

                throw $e;

            }
        });

    }


    public function isCurrentUserDeletingIdMatch($id)
    {
        $userID = Auth::id();

        if($userID == $id)
            throw new GeneralExceptions('No puede eliminarse asi mismo',500);

    }

    private function transformUpperCase($array)
    {
        return array_map(function($value)
        {
            if (is_string($value))
                return strtoupper($value);

            else
                return $value;

        }, $array);
    }

    private function generateSearch($array,$municipalityName,$parishName)
    {
        $search =
        $array['name'] . ' ' .
        $array['authority_ci'] . ' ' .
        $municipalityName . ' ' .
        $parishName . ' ' .
        $array['authority_fullname'];

        return $search;
    }



}
