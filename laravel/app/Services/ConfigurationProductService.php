<?php

namespace App\Services;

use App\Exceptions\GeneralExceptions;
use App\Http\Resources\ConfigurationProductCollection;
use App\Http\Resources\ConfigurationProductResource;
use App\Models\Category;

use DB;
use Exception;

class ConfigurationProductService
{
	public function __construct()
    {
        $this->categoryModel = new Category;
    }

    public function getAllCategories()
    {
        $categories = $this->categoryModel->orderBy('id','desc')->get();
        return new ConfigurationProductCollection($categories);
    }



    public function create($name,$type)
    {
        $model = $this->getModel($type);

        if($model == null)
            throw new GeneralExceptions('Tipo de parametro no reconocido',400);

        $model->fill(['name' => $name]);
        $model->save();
        $model->fresh();

        return new ConfigurationProductResource($model);

    }



    public function update($name,$type,$id)
    {
        $model = $this->getModel($type);

        if($model == null)
            throw new GeneralExceptions('Tipo de parametro no reconocido',400);

        $config = $model->find($id);

        if(!isset($config->id))
            throw new GeneralExceptions('Registro no encontrado',404);

        $config->fill(['name' => $name]);
        $config->save();
        $config->fresh();

        return new ConfigurationProductResource($config);
    }

    public function delete($id,$type)
    {
        $model = $this->getModel($type);
        if($model == null)
            throw new GeneralExceptions('Tipo de parametro no reconocido',400);

        $config = $model->find($id);

        if(!isset($config->id))
            throw new GeneralExceptions('Registro no encontrado',404);

        if($config->products()->exists()){
            throw new Exception('Hay equipos médicos que contienen esta categoría, no puede ser eliminada',400);
        }
        else{

            $config->delete();
        }

        return 0;
    }


    private function getModel($type)
    {
        if($type == 1){
            return new Category;
        }
        else
        {
            return null;
        }
    }

}
