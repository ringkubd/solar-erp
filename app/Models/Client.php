<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;

class Client extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'lead_id', 'company_name', 'email', 'password', 'trade_license', 'tax_id', 
        'billing_address', 'site_address', 'district', 'is_active'
    ];

    protected $hidden = [
        'password',
    ];

    public function contacts() {
        return $this->hasMany(ClientContact::class);
    }

    public function projects() {
        return $this->hasMany(Project::class);
    }
}
