<?php

namespace App\Http\Resources;

use App\Models\Module;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Pagination\LengthAwarePaginator;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */

    public function toArray(Request $request): array
    {   

        return [
            'id' => $this->id,
            'entityCode' => $this->hierarchy->code, 
            'entityName' => $this->hierarchy->name,
            'charge'=> $this->charge,
            'username'=> $this->username,
            'name'=> $this->name,
            'lastName'=> $this->last_name,
            'ci'=> $this->ci,
            'phoneNumber'=> $this->phone_number,
            'address'=> $this->address,
            'email' => $this->email,
            'permissions' => $this->giveFormatToPermissions($this->module_ids,$this->module_names)
        ];
    }

    private function giveFormatToPermissions($modulesIDs,$moduleNames)
    {   
        if($modulesIDs == null)
            return null;
        
        $arrayModuleIds = explode(",", $modulesIDs);
        $arrayModuleNames = explode(",", $moduleNames);
        $result = [];
        $count = 0;
        foreach ($arrayModuleIds as $id) 
        {
            $result[$id] = $arrayModuleNames[$count];
            $count++;
        }

        $result = json_decode(json_encode($result));
        return $result;
    }

}
