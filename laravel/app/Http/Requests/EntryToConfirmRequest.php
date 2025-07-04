<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EntryToConfirmRequest extends FormRequest
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
            'entryToConfirmID' => [
                'required',
                'exists:entry_to_confirmeds,id'
        ],
        ];
    }

    public function messages()
    {
        return [
            'entryToConfirmID.required' => 'La entrada a confirmar es requerido',
            'entryToConfirmID.exists' => 'La entrada a confirmar no existe',
        ];
    }
}
