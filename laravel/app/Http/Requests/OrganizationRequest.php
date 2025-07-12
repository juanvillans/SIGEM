<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;

class OrganizationRequest extends FormRequest
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

            'name' => ['required','string'],
            'municipality_id' => ['nullable','sometimes'],
            'parish_id' => ['nullable','sometimes'],
            'authority_ci'=> ['sometimes'],
            'authority_fullname'=> ['sometimes'],
        ];
    }

     protected function prepareForValidation()
    {
        if ($this->has('authorityCi')) {
            $this->merge([
                'authority_ci' => $this->authorityCi,
            ]);
        }

        if ($this->has('authorityFullname')) {
            $this->merge([
                'authority_fullname' => $this->authorityFullname,
            ]);
        }

        if ($this->has('municipalityId')) {
            $this->merge([
                'municipality_id' => $this->municipalityId,
            ]);
        }

        if ($this->has('parishId')) {
            $this->merge([
                'parish_id' => $this->parishId,
            ]);
        }
    }
}
