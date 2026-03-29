<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\MultiGuardAuthController;

Route::prefix('v1')->group(function() {
    Route::post('/auth/login', [MultiGuardAuthController::class, 'login']);
    Route::post('/auth/register', [MultiGuardAuthController::class, 'registerClient']);
    
    // Public Web Content
    Route::get('/website/content', [\App\Http\Controllers\PublicContentController::class, 'index']);
    Route::get('/website/portfolio', [\App\Http\Controllers\PublicContentController::class, 'portfolio']);
    Route::get('/website/portfolio/{slug}', [\App\Http\Controllers\PublicContentController::class, 'portfolioShow']);
    Route::get('/website/services/{slug}', [\App\Http\Controllers\PublicContentController::class, 'serviceShow']);
    Route::get('/website/products/{slug}', [\App\Http\Controllers\PublicContentController::class, 'productShow']);
    
    Route::get('/website/posts', [\App\Http\Controllers\CMS\PostController::class, 'publicIndex']);
    Route::get('/website/posts/{slug}', [\App\Http\Controllers\CMS\PostController::class, 'publicShow']);
    Route::get('/website/seo/{page}', [\App\Http\Controllers\CMS\SeoController::class, 'getSeoForPage']);
    
    Route::post('/contact', [\App\Http\Controllers\CRM\LeadController::class, 'storePublic']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [MultiGuardAuthController::class, 'logout']);
        Route::get('/auth/me', [MultiGuardAuthController::class, 'me']);
        
        // CMS Module
        Route::apiResource('/cms/products', \App\Http\Controllers\CMS\ProductController::class);
        Route::apiResource('/cms/brands', \App\Http\Controllers\CMS\BrandController::class);
        Route::apiResource('/cms/services', \App\Http\Controllers\CMS\ServiceController::class);
        Route::apiResource('/cms/posts', \App\Http\Controllers\CMS\PostController::class);
        Route::apiResource('/cms/portfolio', \App\Http\Controllers\CMS\PortfolioController::class);
        
        Route::post('/cms/seo', [\App\Http\Controllers\CMS\SeoController::class, 'store']);
        Route::get('/cms/seo', [\App\Http\Controllers\CMS\SeoController::class, 'index']);
        
        // CRM Module
        Route::get('/leads/data/pipeline', [\App\Http\Controllers\CRM\LeadController::class, 'pipeline']);
        Route::get('/leads/{id}/timeline', [\App\Http\Controllers\CRM\LeadController::class, 'timeline']);
        Route::post('/leads/{id}/activities', [\App\Http\Controllers\CRM\LeadController::class, 'addActivity']);
        Route::post('/leads/{id}/ai/followup', [\App\Http\Controllers\AI\AIController::class, 'generateFollowup']);
        Route::post('/leads/{id}/ai/action', [\App\Http\Controllers\AI\AIController::class, 'suggestAction']);
        
        // AI Copilot Routes
        Route::post('/ai/proposal-generate', [\App\Http\Controllers\AI\AIController::class, 'generateProposal']);
        Route::post('/ai/translate', [\App\Http\Controllers\AI\AIController::class, 'translate']);
        
        Route::apiResource('/leads', \App\Http\Controllers\CRM\LeadController::class);
        Route::patch('/leads/{id}/stage', [\App\Http\Controllers\CRM\LeadController::class, 'updateStage']);
        Route::apiResource('/clients', \App\Http\Controllers\CRM\ClientController::class);
        
        // CRM Proposals
        Route::get('/analytics/proposals', [\App\Http\Controllers\CRM\ProposalAnalyticsController::class, 'getDealFlow']);
        Route::post('/proposals/calculate', [\App\Http\Controllers\CRM\ProposalController::class, 'calculate']);
        Route::get('/proposals/auto-fill/{leadId}', [\App\Http\Controllers\CRM\ProposalController::class, 'autoFill']);
        Route::post('/proposals/{id}/clone', [\App\Http\Controllers\CRM\ProposalController::class, 'cloneVersion']);
        Route::patch('/proposals/{id}/status', [\App\Http\Controllers\CRM\ProposalController::class, 'updateStatus']);
        Route::post('/proposals/{id}/ai/probability', [\App\Http\Controllers\AI\AIController::class, 'predictProposalProbability']);
        Route::get('/proposals/{id}/pdf', [\App\Http\Controllers\CRM\ProposalController::class, 'generatePdf']);
        Route::apiResource('/proposals', \App\Http\Controllers\CRM\ProposalController::class);

        // Projects Module
        Route::get('/projects/{id}/ai/risk', [\App\Http\Controllers\AI\AIController::class, 'projectRiskAnalysis']);
        Route::get('/projects/{id}/gantt', [\App\Http\Controllers\Project\ProjectController::class, 'gantt']);
        Route::get('/projects/{id}/profitability', [\App\Http\Controllers\Project\ProjectController::class, 'profitability']);
        
        Route::apiResource('/projects/{project_id}/materials', \App\Http\Controllers\Project\ProjectMaterialController::class);
        Route::apiResource('/projects', \App\Http\Controllers\Project\ProjectController::class);
        
        Route::post('/projects/{projectId}/tasks', [\App\Http\Controllers\Project\ProjectTaskController::class, 'store']);
        Route::patch('/projects/{projectId}/tasks/{taskId}', [\App\Http\Controllers\Project\ProjectTaskController::class, 'update']);
        Route::delete('/projects/{projectId}/tasks/{taskId}', [\App\Http\Controllers\Project\ProjectTaskController::class, 'destroy']);
        Route::patch('/tasks/{taskId}/progress', [\App\Http\Controllers\Project\ProjectTaskController::class, 'updateProgress']);
        Route::post('/site-surveys', [\App\Http\Controllers\Project\SiteSurveyController::class, 'store']);

        // EPC Phase & WBS Routes
        Route::get('/projects/{project}/phases', [\App\Http\Controllers\Project\ProjectPhaseController::class, 'index']);
        Route::post('/projects/{project}/phases', [\App\Http\Controllers\Project\ProjectPhaseController::class, 'store']);
        Route::patch('/projects/{project}/phases/{phase}', [\App\Http\Controllers\Project\ProjectPhaseController::class, 'update']);
        Route::delete('/projects/{project}/phases/{phase}', [\App\Http\Controllers\Project\ProjectPhaseController::class, 'destroy']);

        // EPC Cost Tracking Routes
        Route::get('/projects/{project}/costs', [\App\Http\Controllers\Project\ProjectCostController::class, 'index']);
        Route::post('/projects/{project}/costs', [\App\Http\Controllers\Project\ProjectCostController::class, 'store']);
        Route::patch('/projects/{project}/costs/{cost}', [\App\Http\Controllers\Project\ProjectCostController::class, 'update']);
        Route::delete('/projects/{project}/costs/{cost}', [\App\Http\Controllers\Project\ProjectCostController::class, 'destroy']);

        // Task Dependencies
        Route::post('/tasks/{task}/dependencies', [\App\Http\Controllers\Project\TaskDependencyController::class, 'store']);
        Route::delete('/tasks/{task}/dependencies/{dep}', [\App\Http\Controllers\Project\TaskDependencyController::class, 'destroy']);

        // Project Documents CRUD
        Route::get('/projects/{project}/documents', [\App\Http\Controllers\Project\ProjectDocumentController::class, 'index']);
        Route::post('/projects/{project}/documents', [\App\Http\Controllers\Project\ProjectDocumentController::class, 'store']);
        Route::delete('/projects/{project}/documents/{doc}', [\App\Http\Controllers\Project\ProjectDocumentController::class, 'destroy']);

        // AI Diagnostics
        Route::get('/projects/{id}/ai/diagnostics', [\App\Http\Controllers\AI\AIController::class, 'projectDiagnostics']);
        
        // Invoices & Billing Module
        Route::get('/invoices/{id}/pdf', [\App\Http\Controllers\Invoice\InvoiceController::class, 'generatePdf']);
        Route::post('/invoices/{id}/mark-sent', [\App\Http\Controllers\Invoice\InvoiceController::class, 'markSent']);
        Route::get('/invoices/{invoiceId}/payments', [\App\Http\Controllers\Invoice\InvoicePaymentController::class, 'index']);
        Route::post('/invoices/{invoiceId}/payments', [\App\Http\Controllers\Invoice\InvoicePaymentController::class, 'store']);
        Route::delete('/invoices/{invoiceId}/payments/{paymentId}', [\App\Http\Controllers\Invoice\InvoicePaymentController::class, 'destroy']);
        Route::apiResource('/invoices', \App\Http\Controllers\Invoice\InvoiceController::class);

        // Project → Invoice: auto-draft from milestone
        Route::post('/projects/{projectId}/invoices/from-milestone/{phaseId}', [\App\Http\Controllers\Invoice\InvoiceController::class, 'draftFromMilestone']);
        Route::get('/projects/{projectId}/invoices', [\App\Http\Controllers\Invoice\InvoiceController::class, 'index']);
        
        // ── Finance & Accounting Module ──
        Route::middleware(['employee.role:admin,accountant'])->group(function() {
            Route::get('/receipts/{id}/pdf', [\App\Http\Controllers\Finance\MoneyReceiptController::class, 'pdf']);
            Route::apiResource('/receipts', \App\Http\Controllers\Finance\MoneyReceiptController::class)->only(['index','store','show','destroy']);

            Route::get('/accounts/flat', [\App\Http\Controllers\Finance\AccountController::class, 'flat']);
            Route::apiResource('/accounts', \App\Http\Controllers\Finance\AccountController::class);
            Route::apiResource('/journals', \App\Http\Controllers\Finance\JournalController::class);
            Route::get('/reports/trial-balance', [\App\Http\Controllers\Finance\AccountController::class, 'trialBalance']);
            Route::get('/reports/profit-loss', [\App\Http\Controllers\Finance\AccountController::class, 'profitAndLoss']);
            Route::get('/reports/balance-sheet', [\App\Http\Controllers\Finance\AccountController::class, 'balanceSheet']);
            Route::get('/reports/ledger/{accountId}', [\App\Http\Controllers\Finance\AccountController::class, 'ledger']);
            Route::get('/reports/dashboard', [\App\Http\Controllers\Finance\AccountController::class, 'dashboard']);
        });
        // ─────────────────────────────────

        // Dashboard Stats
        Route::get('/dashboard/stats', [\App\Http\Controllers\DashboardController::class, 'stats']);
        // Inventory Management
        Route::apiResource('/inventory/warehouses', \App\Http\Controllers\Inventory\WarehouseController::class);
        Route::apiResource('/inventory/vendors', \App\Http\Controllers\Inventory\VendorController::class);
        Route::post('/inventory/purchase-orders/{id}/receive', [\App\Http\Controllers\Inventory\PurchaseOrderController::class, 'receive']);
        Route::apiResource('/inventory/purchase-orders', \App\Http\Controllers\Inventory\PurchaseOrderController::class);
        Route::apiResource('/inventory/transfers', \App\Http\Controllers\Inventory\StockTransferController::class);

        Route::apiResource('/inventory/items', \App\Http\Controllers\Inventory\InventoryController::class);
        Route::get('/inventory/items/{id}/history', [\App\Http\Controllers\Inventory\InventoryController::class, 'history']);
        Route::apiResource('/inventory/categories', \App\Http\Controllers\Inventory\InventoryCategoryController::class);
        Route::post('/inventory/movements', [\App\Http\Controllers\Inventory\InventoryController::class, 'move']);
        
        // HR Management
        Route::get('/hr/departments', [App\Http\Controllers\HR\EmployeeController::class, 'departments']);
        Route::get('/hr/designations', [App\Http\Controllers\HR\EmployeeController::class, 'designations']);
        Route::get('/hr/employees', [App\Http\Controllers\HR\EmployeeController::class, 'index']);
        Route::post('/hr/employees', [App\Http\Controllers\HR\EmployeeController::class, 'store']);
        Route::get('/hr/employees/{id}', [App\Http\Controllers\HR\EmployeeController::class, 'show']);
        Route::put('/hr/employees/{id}', [App\Http\Controllers\HR\EmployeeController::class, 'update']);
        Route::put('/hr/employees/{id}/password', [App\Http\Controllers\HR\EmployeeController::class, 'updatePassword']);
        
        Route::post('/attendance', [App\Http\Controllers\HR\AttendanceController::class, 'store']);
        Route::get('/hr/employees/{id}/attendance', [App\Http\Controllers\HR\AttendanceController::class, 'index']);
        
        Route::post('/timesheet', [App\Http\Controllers\HR\TimesheetController::class, 'store']);
        Route::get('/hr/employees/{id}/timesheets', [App\Http\Controllers\HR\TimesheetController::class, 'index']);
        
        Route::post('/payroll', [App\Http\Controllers\HR\PayrollController::class, 'store']);
        Route::get('/hr/employees/{id}/payrolls', [App\Http\Controllers\HR\PayrollController::class, 'index']);

        // Email & Webmail
        Route::prefix('mail')->group(function () {
            Route::get('inbox', [\App\Http\Controllers\Email\WebmailController::class, 'inbox']);
            Route::get('message/{uid}', [\App\Http\Controllers\Email\WebmailController::class, 'show']);
            Route::post('send', [\App\Http\Controllers\Email\WebmailController::class, 'send']);
            Route::get('message/{uid}/summarize', [\App\Http\Controllers\Email\WebmailController::class, 'summarize']);
            Route::post('ai-generate', [\App\Http\Controllers\Email\WebmailController::class, 'generateDraft']);
        });

        Route::prefix('email')->group(function () {
            Route::get('accounts', [\App\Http\Controllers\Email\EmailAccountController::class, 'index']);
            Route::get('accounts/{id}', [\App\Http\Controllers\Email\EmailAccountController::class, 'show']);
            Route::put('accounts/{id}', [\App\Http\Controllers\Email\EmailAccountController::class, 'update']);
            Route::post('sync', [\App\Http\Controllers\Email\EmailAccountController::class, 'sync']);
        });
    });

    // Employee Portal Routes
    Route::middleware(['auth:sanctum', 'guard:employee'])->prefix('employee')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\HR\EmployeePortalController::class, 'dashboard']);
        Route::get('/tasks', [\App\Http\Controllers\HR\EmployeePortalController::class, 'myTasks']);
        Route::get('/attendance', [\App\Http\Controllers\HR\EmployeePortalController::class, 'myAttendance']);
        Route::get('/timesheets', [\App\Http\Controllers\HR\EmployeePortalController::class, 'myTimesheets']);
    });

    // Client Portal Routes
    Route::middleware(['auth:sanctum', 'guard:client'])->prefix('client')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\CRM\ClientPortalController::class, 'dashboard']);
        Route::get('/invoices', [\App\Http\Controllers\CRM\ClientPortalController::class, 'invoices']);
        Route::get('/projects/{id}', [\App\Http\Controllers\CRM\ClientPortalController::class, 'projectDetails']);
    });
});
