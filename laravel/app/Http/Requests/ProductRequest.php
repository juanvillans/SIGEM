<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;

class ProductRequest extends FormRequest
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
            
            'minimumStock' => ['required'],
            'name' => ['required','string','max:100',
            Rule::unique('products')->where(function ($query) {
                    return $query
                    ->where('name', $this->name)
                    ->where('type_presentation_id', $this->typePresentationId)
                    ->where('type_administration_id', $this->typeAdministrationId)
                    ->where('medicament_id', $this->medicamentId)
                    ->where('category_id', $this->categoryId)
                    ->where('unit_per_package', $this->unitPerPackage)
                    ->where('concentration_size', $this->concentrationSize);
                })->ignore($this->product ?? null)
            ],
            'categoryId' => ['required',Rule::exists('categories', 'id')],
            'typePresentationId' => ['required',Rule::exists('type_presentations', 'id')],
            'typeAdministrationId' => ['required',Rule::exists('type_presentations', 'id')],
            'medicamentId' => ['required',Rule::exists('medicaments', 'id')],
            'unitPerPackage' => ['required'],
            'concentrationSize' => ['required'],

        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json(['errors' => $validator->errors()], 422));
    }
}
