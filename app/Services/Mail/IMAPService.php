<?php

namespace App\Services\Mail;

use Webklex\PHPIMAP\ClientManager;
use App\Models\EmailAccount;
use Webklex\PHPIMAP\Exceptions\MaskNotFoundException;

class IMAPService
{
    protected $cm;

    public function __construct(ClientManager $cm)
    {
        $this->cm = $cm;
    }

    /**
     * Get a client instance for a specific email account.
     */
    public function getClient(EmailAccount $account)
    {
        return $this->cm->make([
            'host'          => '127.0.0.1',
            'port'          => 993,
            'encryption'    => 'ssl',
            'validate_cert' => false,
            'username'      => $account->email,
            'password'      => 'system_master_pass', // Or individual password if needed
            'protocol'      => 'imap'
        ]);
    }

    /**
     * Fetch inbox messages for an account.
     */
    public function fetchMessages(EmailAccount $account, $folder = 'INBOX', $limit = 20, $page = 1)
    {
        $client = $this->getClient($account);
        $client->connect();

        $f = $client->getFolder($folder);
        $messages = $f->query()->all()->limit($limit, ($page - 1) * $limit)->get();

        return $messages->map(function($msg) {
            return [
                'uid'       => $msg->getUid(),
                'subject'   => $msg->getSubject()->toString(),
                'from'      => $msg->getFrom()[0]->full,
                'date'      => $msg->getDate()->toString(),
                'has_attachments' => $msg->hasAttachments(),
                'is_seen'   => $msg->getFlags()->has('seen'),
                'preview'   => substr(strip_tags($msg->getHTMLBody() ?: $msg->getTextBody()), 0, 100),
            ];
        });
    }

    /**
     * Fetch a single message detail.
     */
    public function getMessage(EmailAccount $account, $uid, $folder = 'INBOX')
    {
        $client = $this->getClient($account);
        $client->connect();

        $f = $client->getFolder($folder);
        $msg = $f->query()->getMessageByUid($uid);

        if (!$msg) return null;

        return [
            'uid'       => $msg->getUid(),
            'subject'   => $msg->getSubject()->toString(),
            'from'      => $msg->getFrom()[0]->full,
            'to'        => $msg->getTo()[0]->full,
            'date'      => $msg->getDate()->toString(),
            'body'      => $msg->getHTMLBody() ?: $msg->getTextBody(),
            'attachments' => $msg->getAttachments()->map(function($a) {
                return [
                    'id'   => $a->id,
                    'name' => $a->name,
                    'size' => $a->size,
                    'type' => $a->type,
                ];
            }),
        ];
    }
}
