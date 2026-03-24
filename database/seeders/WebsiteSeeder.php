<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Brand;
use App\Models\Service;
use Illuminate\Support\Facades\DB;

class WebsiteSeeder extends Seeder
{
    public function run(): void
    {
        // Clear existing data to avoid duplicates if run multiple times
        DB::table('products')->truncate();
        DB::table('brands')->truncate();
        DB::table('services')->truncate();

        // 1. Seed Products
        $products = [
            [
                'title' => 'Transformers',
                'category' => 'Distribution & Power',
                'description' => 'Complete range of distribution, power, and dry-type transformers for utility, industrial & commercial applications. All routine & type tests performed per IEC-76, BDS 1081, ANSI, AEC & BSTI standards.',
                'icon' => 'plug', // Using lucide-react icon names roughly
                'specs' => ['100 KVA – 12,500 KVA', '33kV / 11kV', 'OLTC / NLTC', 'Oil & Dry-Type', 'Dyn11']
            ],
            [
                'title' => 'HT, LT Switchgear & PFI Panel',
                'category' => 'Switchgear & Panels',
                'description' => 'CPT Brand HT and LT switchgear panels for safe power distribution and power factor improvement. Built to IEC 62271, IEC 61439, and IEC 60831 standards.',
                'icon' => 'server',
                'specs' => ['HT Panel', 'LT Panel', 'PFI Panel', 'MDB / SDB / DB']
            ],
            [
                'title' => 'Diesel Generators',
                'category' => 'Backup Power',
                'description' => 'Reliable power solutions for industrial, commercial, and residential sectors. Ready stock from 20–500 kVA. Custom configurations up to 2,000 kVA available.',
                'icon' => 'zap',
                'specs' => ['20 – 2,000 kVA', 'Perkins', 'Cummins', 'Ricardo', 'Stamford']
            ],
            [
                'title' => 'Solar Power Systems',
                'category' => 'Renewable Energy',
                'description' => 'SREDA-approved complete solar solutions — on-grid, off-grid, hybrid, solar street lights, and solar irrigation systems. Top-tier panels, inverters, and accessories.',
                'icon' => 'sun',
                'specs' => ['On-Grid', 'Off-Grid', 'Hybrid', 'Growatt / Solis', 'JA / Longi / Jinko']
            ],
            [
                'title' => 'Lightning Protection (LPS)',
                'category' => 'Safety Systems',
                'description' => 'Conventional and ESE/Digital LPS solutions. Direct lightning protection devices, surge protection, and earthing systems for industrial, commercial & residential use.',
                'icon' => 'cloud-lightning',
                'specs' => ['ABB OPR', 'Onay Paratoner', 'Up to 214m range', 'IEC 62305']
            ],
            [
                'title' => 'Lift & Elevator',
                'category' => 'Vertical Transport',
                'description' => 'Safe and comfortable passenger elevators designed for accessibility. Available for 6, 8, 10, and 13-person capacities with speeds up to 4.0 m/s.',
                'icon' => 'arrow-up-down',
                'specs' => ['SIGMA', 'FUJI Elevators', 'ACL', '450–1050 kg']
            ],
            [
                'title' => 'HVAC (VRF System)',
                'category' => 'Climate Control',
                'description' => 'Variable Refrigerant Flow (VRF) systems with precise temperature control and energy efficiency. One outdoor unit connected to multiple indoor units for zoned climate control.',
                'icon' => 'snowflake',
                'specs' => ['Dunham-Bush', 'Samsung', 'Cassette & Duct', 'Multizone']
            ],
            [
                'title' => 'Busbar Trunking (BBT)',
                'category' => 'Power Distribution',
                'description' => 'Light-weight, low-impedance busduct systems with copper or aluminium bars. Indoor and outdoor versions with fire retardant protection per IEC 60331.',
                'icon' => 'radio-receiver',
                'specs' => ['25A – 6,300A', 'Up to 1000V', 'MEGADUCT', 'EAE']
            ],
            [
                'title' => 'BMS & IT Solutions',
                'category' => 'Smart Buildings',
                'description' => 'Intelligent Building Management Systems for centralized HVAC, lighting, energy monitoring, fire alarm, CCTV, and access control integration.',
                'icon' => 'building-2',
                'specs' => ['HVAC Control', 'Energy Monitoring', 'Access Control', 'CCTV']
            ],
            [
                'title' => 'Cable Tray Systems',
                'category' => 'Cable Management',
                'description' => 'Structured cable tray systems — perforated, ladder, wire mesh, and solid-bottom types with a full range of connectors and fittings for any routing requirement.',
                'icon' => 'layers',
                'specs' => ['Perforated', 'Ladder Type', 'Wire Mesh', '20+ Fittings']
            ],
            [
                'title' => 'Breakers & Protection Devices',
                'category' => 'Protection & Control',
                'description' => 'Complete range of circuit protection — ACB, VCB, LBS, MCCB, MCB, RCBO, OLR, AVR, ARD, CT & PT, ATS, isolators, and capacitor banks for power factor correction.',
                'icon' => 'shield-check',
                'specs' => ['ACB / VCB', 'MCCB / MCB', 'AVR / ARD', 'CT & PT']
            ],
            [
                'title' => 'Commercial & Industrial LED',
                'category' => 'Lighting',
                'description' => 'Full LED lighting range — high bay, flood lights, panel lights, street lights, explosion-proof, track lights, and emergency exit lights for all environments.',
                'icon' => 'lightbulb',
                'specs' => ['High Bay', 'Flood Light', 'IP65 Rated', 'Emergency Exit']
            ]
        ];

        foreach ($products as $p) {
            Product::create($p);
        }

        // 2. Seed Brands
        $brands = [
            ['name' => 'ABB', 'description' => 'Power & Automation', 'color' => '#e63329'],
            ['name' => 'SIEMENS', 'description' => 'Electrical Systems', 'color' => '#009999'],
            ['name' => 'Schneider', 'description' => 'Electric Solutions', 'color' => '#3dcd58'],
            ['name' => 'CHINT', 'description' => 'Chint Electric', 'color' => '#e63329'],
            ['name' => 'Perkins', 'description' => 'Diesel Generators', 'color' => ''],
            ['name' => 'Ricardo', 'description' => 'Engine Technology', 'color' => ''],
            ['name' => 'HYUNDAI', 'description' => 'Power Systems', 'color' => '#00a0e3'],
            ['name' => 'LS', 'description' => 'Electrical Equipment', 'color' => ''],
            ['name' => 'Growatt', 'description' => 'Solar Inverters', 'color' => '#ff6c00'],
            ['name' => 'Solis', 'description' => 'Solar Inverters', 'color' => '#005baa'],
            ['name' => 'JA Solar', 'description' => 'Solar Panels', 'color' => ''],
            ['name' => 'Jinko', 'description' => 'Solar Modules', 'color' => '#e63329'],
            ['name' => 'LONGI', 'description' => 'Solar Technology', 'color' => '#00a651'],
            ['name' => 'SIGMA', 'description' => 'Elevators', 'color' => ''],
            ['name' => 'FUJI', 'description' => 'Elevator Systems', 'color' => '#e63329'],
            ['name' => 'Samsung', 'description' => 'HVAC / VRF', 'color' => '#005baa'],
        ];

        foreach ($brands as $index => $b) {
            $b['order_num'] = $index + 1;
            Brand::create($b);
        }

        // 3. Seed Services (Why Us)
        $services = [
            [
                'title' => 'International Brands',
                'description' => 'We stock and supply products from globally recognized brands — ABB, Siemens, Schneider, Perkins, Cummins, and more — ensuring you always get certified, quality equipment.',
                'icon' => 'award',
                'order_num' => 1
            ],
            [
                'title' => 'Ready Stock Availability',
                'description' => 'Diesel generators from 20–500 kVA and a wide range of electrical accessories are available from ready stock, minimizing your project downtime.',
                'icon' => 'zap-fast', // Use standard zap
                'order_num' => 2
            ],
            [
                'title' => 'In-House Testing Lab',
                'description' => 'All transformers undergo rigorous routine and type testing at our well-equipped testing laboratory as per IEC, BDS, ANSI, and BSTI standards before delivery.',
                'icon' => 'microscope',
                'order_num' => 3
            ],
            [
                'title' => 'SREDA Approved Solar',
                'description' => 'Our solar accessories and systems carry SREDA approval, making us a trusted partner for Bangladesh\'s green energy transition.',
                'icon' => 'sun',
                'order_num' => 4
            ],
            [
                'title' => 'Complete After-Sales',
                'description' => 'From generator spare parts to elevator maintenance, we provide comprehensive after-sales support including AMC (Annual Maintenance Contracts) to keep your systems running.',
                'icon' => 'wrench',
                'order_num' => 5
            ],
            [
                'title' => 'One-Stop Solution',
                'description' => 'From power generation to distribution, protection, solar, HVAC, elevators, and BMS — ECOPAC is your single window for all building and industrial electrical needs.',
                'icon' => 'building',
                'order_num' => 6
            ]
        ];

        foreach ($services as $s) {
            Service::create($s);
        }
    }
}
