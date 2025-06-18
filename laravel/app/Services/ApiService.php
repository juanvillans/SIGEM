<?php

namespace App\Services;
use App\Models\User;
use Illuminate\Support\Str;

class ApiService
{
    protected $snakeCaseMap = [];


    public function convertToSnakeCase($request)
    {

        $fields = $request->all();
        $data = [];
        foreach ($fields as $field => $value)
        {

            $column = $this->snakeCaseMap[$field] ?? $field;

            $data[$column] = $value;
        }

        return $data;

    }

    public function convertToSnakeCaseWithArray($array)
    {


        $data = [];
        foreach ($array as $field => $value)
        {

            $column = $this->snakeCaseMap[$field] ?? $field;

            $data[$column] = $value;
        }

        return $data;

    }

    protected function parseQuery($value)
    {
        $string = $value;
        $parts = preg_split("/\[(OR)\]/", $string, -1, PREG_SPLIT_DELIM_CAPTURE);

        for ($i = 0; $i < count($parts); $i += 2)
        {
                $result[] = $parts[$i];
        }

        return $result;
    }

    protected function generateString($value)
    {
      $result = '%' . $value . '%';

      return $result;
    }


}
