<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class MaintenanceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [

            'inventory_general_id' => [
                'required',
                'integer',
                'exists:inventory_generals,id'
            ],
            'type_maintenance_id' => [
                'required',
                'integer',
                'exists:type_maintenances,id'
            ],
            'components' => [
                'array'
            ],
            'description' => [
                'required',
                'string',
                'max:1000'
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages()
    {
        return [
            'entity_code.required' => 'El código de entidad es obligatorio.',
            'entity_code.exists' => 'El código de entidad no existe en el sistema.',
            'inventory_general_id.required' => 'El ID de inventario general es obligatorio.',
            'inventory_general_id.exists' => 'El ID de inventario general no existe en el sistema.',
            'type_maintenance_id.required' => 'El tipo de mantenimiento es obligatorio.',
            'type_maintenance_id.exists' => 'El tipo de mantenimiento seleccionado no es válido.',
            'description.required' => 'La descripción del mantenimiento es obligatoria.',
            'description.max' => 'La descripción no debe exceder los 1000 caracteres.',
        ];
    }

    protected function prepareForValidation()
    {
        $this->merge([
            'entity_code' => auth()->user()->entity_code,
        ]);
    }
}
