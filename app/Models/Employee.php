<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;

class Employee extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'user_id', 'department_id', 'designation_id', 'employee_id', 
        'first_name', 'last_name', 'email', 'password', 'phone', 'role', 
        'salary', 'salary_structure', 'join_date', 'status', 'is_active', 'address', 'contract_file'
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'salary_structure' => 'array',
        'join_date' => 'date'
    ];

    protected $appends = ['full_name', 'profile_completeness'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function designation()
    {
        return $this->belongsTo(Designation::class);
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    public function timesheets()
    {
        return $this->hasMany(Timesheet::class);
    }

    public function payrolls()
    {
        return $this->hasMany(Payroll::class);
    }

    public function documents()
    {
        return $this->hasMany(EmployeeDocument::class);
    }

    public function roles()
    {
        return $this->hasMany(EmployeeRole::class);
    }

    public function emailAccount()
    {
        return $this->hasOne(EmailAccount::class);
    }

    public function projects()
    {
        return $this->belongsToMany(Project::class, 'project_employee')
                    ->withPivot('role_in_project')
                    ->withTimestamps();
    }

    public function getProfileCompletenessAttribute()
    {
        $fields = [
            'first_name', 'last_name', 'email', 'phone', 'designation_id', 
            'department_id', 'join_date', 'salary', 'address', 'contract_file'
        ];
        
        $filledCount = 0;
        foreach ($fields as $field) {
            if (!empty($this->$field)) {
                $filledCount++;
            }
        }

        // Also check if they have at least one document
        if ($this->documents()->count() > 0) {
            $filledCount++;
        }

        $totalFields = count($fields) + 1; // +1 for documents
        return round(($filledCount / $totalFields) * 100);
    }

    public function getFullNameAttribute()
    {
        return "{$this->first_name} {$this->last_name}";
    }

    protected static function booted(): void
    {
        static::created(function (Employee $employee) {
            // Logic for internal DB record
            $domain = 'ecopacpowertech.com';
            $email  = strtolower($employee->first_name . '.' . $employee->last_name) . '@' . $domain;
            
            if (EmailAccount::where('email', $email)->exists()) {
                $email = strtolower($employee->first_name . '.' . $employee->last_name . $employee->id) . '@' . $domain;
            }

            $password = $employee->password; // Note: this is already hashed in controller

            // Create record in ERP DB
            $account = $employee->emailAccount()->create([
                'email'         => $email,
                'password_hash' => $password,
                'mailbox_path'  => "/var/mail/vhosts/{$domain}/" . str_replace('@' . $domain, '', $email),
                'quota_gb'      => 5.00,
                'status'        => 'provisioning'
            ]);

            // Trigger external provisioning via FluxAgent
            try {
                $flux = app(\App\Services\FluxAgentService::class);
                $result = $flux->createMailAccount(
                    domain: $domain,
                    email: str_replace('@' . $domain, '', $email),
                    password: 'Ecopac@2026', // We should probably use a temporary plain password or sync correctly
                    webhookUrl: route('api.flux.webhook')
                );

                if (isset($result['job_id'])) {
                    $account->update(['provision_job_id' => $result['job_id']]);
                }
            } catch (\Exception $e) {
                \Log::error('FluxAgent trigger failed', ['error' => $e->getMessage()]);
            }
        });
    }
}
