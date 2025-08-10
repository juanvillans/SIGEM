<?php

namespace App\Http\Requests;

use App\Enums\LevelProductEnum;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\Exceptions\HttpResponseException;

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
            'machine' => [
                'required',
                'string',
                'max:100',
                Rule::unique('products')->where(function ($query) {
                    return $query
                        ->where('machine', $this->machine)
                        ->where('brand', $this->brand)
                        ->where('model', $this->model);
                })->ignore($this->product ?? null)
            ],
            'brand' => ['required', 'string', 'max:100'],
            'model' => ['required', 'string', 'max:100'],
            'required_components' => ['nullable', 'array'],
            'required_components.*' => ['string', 'max:255'],
            'level' => [
                'string',
                'required',
                Rule::in(['BAJO', 'MEDIO', 'ALTO'])
            ],

        ];
    }

    protected function prepareForValidation()
    {
        if ($this->has('level')) {

            $level = $this->level;

            $newLevel = match ($level) {
                LevelProductEnum::LOW->value => 'BAJO',
                LevelProductEnum::MEDIUM->value => 'MEDIO',
                LevelProductEnum::HIGH->value => 'ALTO',
                default => 'Valor desconocido'
            };

            $this->merge(
                ['level' => $newLevel]
            );
        }
    }
}
