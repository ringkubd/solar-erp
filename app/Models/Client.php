<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    protected $fillable = [
        'lead_id', 'company_name', 'trade_license', 'tax_id', 
        'billing_address', 'site_address', 'district'
    ];

    public function contacts() {
        return $this->hasMany(ClientContact::class);
    }
}
