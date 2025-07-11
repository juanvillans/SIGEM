<?php 

namespace App\Filters;

use Illuminate\Http\Request;
use App\Filters\ApiFilter;


class OrganizationQueryFilter extends ApiFilter
{
    
    protected $mainTable = 'organizations';

    protected $allowedParams = [

        'organizations' => ['code','authorityCi','authorityFullname','name','municipalityId','parishId'],
        'search' =>['all'],
    ];
    

    protected $tableMap = [

        'organizations' => 'organizations',

     ];

     protected $columnMap = [

        'code' => 'code',
        'authorityFullname' => 'authority_fullname',    
        'authorityCi' => 'authority_ci',
        'municipalityId' => 'municipality_id',
        'parishId' => 'parish_id'
     ];

     protected $orderByMap = 
     [
     ];
}
