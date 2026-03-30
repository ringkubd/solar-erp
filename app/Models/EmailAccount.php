<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailAccount extends Model
{
    protected $fillable = [
        'employee_id',
        'email',
        'password_hash',
        'mailbox_path',
        'quota_gb',
        'is_active',
        'last_login_at',
        'status',
        'provision_job_id',
        'error_log'
    ];

    protected $casts = [
        'quota_gb'      => 'decimal:2',
        'is_active'     => 'boolean',
        'last_login_at' => 'datetime',
    ];

    protected $hidden = [
        'password_hash',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
