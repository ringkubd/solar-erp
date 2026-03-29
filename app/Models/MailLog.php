<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MailLog extends Model
{
    protected $fillable = [
        'email_account_id',
        'subject',
        'recipient',
        'type',
        'is_success',
        'error_message',
        'sender_ip'
    ];

    public function account()
    {
        return $this->belongsTo(EmailAccount::class, 'email_account_id');
    }
}
