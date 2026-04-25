<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Product;

class ExtendedProductsSeeder extends Seeder
{
    public function run()
    {
        // Extended brands list (covering more of the 93 brands)
        $brands = [
            'Bosch', 'K&N', 'NGK', 'Mann-Filter', 'Fram', 'Mobil', 'Valvoline', 'Peak', 'Gates',
            'Brembo', 'Castrol', 'Akebono', 'Raybestos', 'TRW', 'Continental', 'Wagner',
            'KYB', 'Eibach', 'Moog', 'Monroe', 'OEM', 'Hellwig', 'Multi-Leaf',
            'Optima', 'Denso', 'Motorcraft', 'Sylvania', 'PIAA', 'Dorman', 'ACDelco',
            'Delphi', 'Valeo', 'Hella', 'Philips', 'Osram', 'Febreze', 'Bushwacker',
            'Thule', 'WeatherTech', 'Prestige', 'Sparco', 'ABS', 'AEVA', 'Careless',
            'MagnaFlow', 'Flowmaster', 'Edelbrock', 'Holley', 'MSD', 'ARP', 'Fel-Pro',
            'Melling', 'Sealed Power', 'Clevite', 'National', 'Timken', 'SKF', 'Dayco',
            'Standard Motor Products', 'Cardone', 'Duralast', 'Carquest', 'STP', 'Pennzoil',
            'Quaker State', 'Shell', 'Castrol Edge', 'Royal Purple', 'Lucas Oil',
            'Purolator', 'Wix', 'K&N', 'AFE', 'Spectre', 'Airaid', 'Volant',
            'Flowmaster', 'Magnaflow', 'Borla', 'Corsa', 'MBRP', 'Diamond Eye',
            'Rancho', 'Bilstein', 'Fox', 'King', 'Fabtech', 'Pro Comp', 'Tuff Country',
            'Rough Country', 'Superlift', 'Zone Offroad', 'Skyjacker', 'ICON',
        ];

        // Vehicle types/makes (covering more of the 54 types)
        $vehicleTypes = [
            'Toyota Corolla', 'Toyota Camry', 'Toyota RAV4', 'Toyota Hilux', 'Toyota Land Cruiser',
            'Honda Civic', 'Honda Accord', 'Honda CR-V', 'Honda HR-V', 'Honda Jazz',
            'Nissan Altima', 'Nissan Sentra', 'Nissan Rogue', 'Nissan X-Trail', 'Nissan Navara',
            'Ford Focus', 'Ford Mustang', 'Ford F-150', 'Ford Ranger', 'Ford Everest',
            'BMW 3 Series', 'BMW 5 Series', 'BMW X3', 'BMW X5',
            'Mercedes C-Class', 'Mercedes E-Class', 'Mercedes GLC', 'Mercedes GLE',
            'Audi A4', 'Audi A6', 'Audi Q5', 'Audi Q7',
            'Volkswagen Golf', 'Volkswagen Passat', 'Volkswagen Tiguan', 'Volkswagen Amarok',
            'Mazda 3', 'Mazda 6', 'Mazda CX-5', 'Mazda BT-50',
            'Hyundai Elantra', 'Hyundai Tucson', 'Hyundai Santa Fe', 'Hyundai Starex',
            'Kia Forte', 'Kia Sportage', 'Kia Sorento', 'Kia Carnival',
            'Mitsubishi Lancer', 'Mitsubishi Pajero', 'Mitsubishi Montero', 'Mitsubishi Strada',
            'Subaru Impreza', 'Subaru Forester', 'Subaru Outback', 'Subaru XV',
        ];

        $categories = Category::all();
        if ($categories->isEmpty()) {
            $this->command->error('No categories found. Please run DatabaseSeeder first.');
            return;
        }

        $productsAdded = 0;
        $productTypes = [
            ['suffix' => '', 'price_mult' => 1.0],
            ['suffix' => ' Premium', 'price_mult' => 1.3],
            ['suffix' => ' Performance', 'price_mult' => 1.6],
            ['suffix' => ' OEM', 'price_mult' => 1.1],
            ['suffix' => ' Economy', 'price_mult' => 0.7],
        ];

        foreach ($categories as $category) {
            $baseProducts = $this->getBaseProductsForCategory($category->name);
            
            foreach ($baseProducts as $baseProduct) {
                // Create variants for different brands
                for ($i = 0; $i < min(5, count($brands)); $i++) {
                    $brand = $brands[array_rand($brands)];
                    $variant = $productTypes[array_rand($productTypes)];
                    $vehicle = $vehicleTypes[array_rand($vehicleTypes)];
                    
                    $name = $baseProduct['name'] . $variant['suffix'];
                    $slug = \Illuminate\Support\Str::slug($name . ' ' . $brand . ' ' . $vehicle);
                    
                    // Check if product already exists
                    if (Product::where('slug', $slug)->exists()) {
                        continue;
                    }
                    
                    $basePrice = $baseProduct['base_price'] * $variant['price_mult'];
                    $price = round($basePrice * (0.9 + mt_rand(0, 20) / 100), 2);
                    
                    Product::create([
                        'name' => $name,
                        'slug' => $slug,
                        'brand' => $brand,
                        'category_id' => $category->id,
                        'price' => $price,
                        'stock' => mt_rand(10, 100),
                        'description' => $baseProduct['description'] . ' Compatible with ' . $vehicle . '.',
                        'vehicle_compatibility' => $vehicle,
                        'images' => $baseProduct['images'],
                        'is_active' => true,
                        'is_hot_deal' => mt_rand(1, 10) === 1,
                        'is_premium' => $variant['price_mult'] > 1.3,
                    ]);
                    
                    $productsAdded++;
                    
                    if ($productsAdded >= 200) {
                        break 3;
                    }
                }
            }
        }

        $this->command->info("Added {$productsAdded} extended products.");
    }

    private function getBaseProductsForCategory($categoryName)
    {
        $products = [
            'Engine Parts' => [
                ['name' => 'Oil Filter', 'base_price' => 150, 'description' => 'High-quality oil filter for engine protection.', 'images' => ['/images/oil filter.jpg']],
                ['name' => 'Air Filter', 'base_price' => 250, 'description' => 'Premium air filter for optimal airflow.', 'images' => ['/images/Air Filter.jpg']],
                ['name' => 'Spark Plug', 'base_price' => 100, 'description' => 'Durable spark plug for efficient ignition.', 'images' => ['/images/Spar plus.jpg']],
                ['name' => 'Fuel Filter', 'base_price' => 120, 'description' => 'Reliable fuel filter for clean fuel delivery.', 'images' => ['/images/Fuel Filter.jpg']],
                ['name' => 'PCV Valve', 'base_price' => 160, 'description' => 'Positive crankcase ventilation valve.', 'images' => ['/images/PCV Valve.jpg']],
                ['name' => 'Timing Belt', 'base_price' => 850, 'description' => 'Durable timing belt for engine synchronization.', 'images' => ['/images/Serpentine Belt.jpg']],
                ['name' => 'Water Pump', 'base_price' => 1200, 'description' => 'Efficient water pump for cooling system.', 'images' => ['/images/Coolant Radiator Fluid.jpg']],
                ['name' => 'Thermostat', 'base_price' => 450, 'description' => 'Precision thermostat for temperature control.', 'images' => ['/images/Coolant Radiator Fluid.jpg']],
            ],
            'Brake Systems' => [
                ['name' => 'Brake Pad Set', 'base_price' => 450, 'description' => 'High-performance brake pads for safety.', 'images' => ['/images/Brake pads.jpg']],
                ['name' => 'Brake Rotor', 'base_price' => 650, 'description' => 'Quality brake rotor for smooth braking.', 'images' => ['/images/Brake Rotor (Disc).jpg']],
                ['name' => 'Brake Caliper', 'base_price' => 750, 'description' => 'Reliable brake caliper assembly.', 'images' => ['/images/Brake Caliper (Front).jpg']],
                ['name' => 'Brake Drum', 'base_price' => 420, 'description' => 'Durable brake drum for rear brakes.', 'images' => ['/images/Brake Drum.jpg']],
                ['name' => 'Brake Hose', 'base_price' => 280, 'description' => 'Flexible brake hose for hydraulic system.', 'images' => ['/images/Brake Hose Assembly.jpg']],
                ['name' => 'Master Cylinder', 'base_price' => 850, 'description' => 'Brake master cylinder for hydraulic pressure.', 'images' => ['/images/Brake Master Cylinder.jpg']],
                ['name' => 'ABS Sensor', 'base_price' => 380, 'description' => 'Wheel speed sensor for ABS system.', 'images' => ['/images/ABS Sensor.jpg']],
                ['name' => 'Brake Fluid', 'base_price' => 120, 'description' => 'High-temperature brake fluid DOT 4.', 'images' => ['/images/Brake Fluid.jpg']],
            ],
            'Suspension' => [
                ['name' => 'Shock Absorber', 'base_price' => 780, 'description' => 'Gas-charged shock absorber for smooth ride.', 'images' => ['/images/Shock Absorber.jpg']],
                ['name' => 'Strut Assembly', 'base_price' => 950, 'description' => 'Complete strut assembly with spring.', 'images' => ['/images/Strut Assembly.jpg']],
                ['name' => 'Control Arm', 'base_price' => 580, 'description' => 'Lower control arm with ball joint.', 'images' => ['/images/Control Arm.jpg']],
                ['name' => 'Ball Joint', 'base_price' => 450, 'description' => 'Tough ball joint for suspension.', 'images' => ['/images/Ball Joint.jpg']],
                ['name' => 'Tie Rod End', 'base_price' => 240, 'description' => 'Steering tie rod end assembly.', 'images' => ['/images/Tie Rod End.jpg']],
                ['name' => 'Sway Bar Link', 'base_price' => 290, 'description' => 'Stabilizer bar link kit.', 'images' => ['/images/Sway Bar Link.jpg']],
                ['name' => 'Coil Spring', 'base_price' => 400, 'description' => 'Heavy-duty coil spring.', 'images' => ['/images/Coil Spring.jpg']],
                ['name' => 'Leaf Spring', 'base_price' => 620, 'description' => 'Multi-leaf spring for trucks.', 'images' => ['/images/Leaf Spring.jpg']],
            ],
            'Electrical Components' => [
                ['name' => 'Alternator', 'base_price' => 1300, 'description' => 'High-output alternator for charging.', 'images' => ['/images/Alternator.jpg']],
                ['name' => 'Starter Motor', 'base_price' => 1100, 'description' => 'Powerful starter motor for ignition.', 'images' => ['/images/Starter Motor.jpg']],
                ['name' => 'Battery', 'base_price' => 950, 'description' => 'Maintenance-free car battery.', 'images' => ['/images/Car Battery.jpg']],
                ['name' => 'Headlight Bulb', 'base_price' => 180, 'description' => 'Bright headlight bulb pair.', 'images' => ['/images/LED Headlight Bulbs.jpg']],
                ['name' => 'Tail Light', 'base_price' => 80, 'description' => 'Red tail light bulb.', 'images' => ['/images/Tail Light Bulb.jpg']],
                ['name' => 'Wiper Motor', 'base_price' => 650, 'description' => 'Front wiper motor assembly.', 'images' => ['/images/Wiper Blade Assembly.jpg']],
                ['name' => 'Ignition Coil', 'base_price' => 350, 'description' => 'High-voltage ignition coil.', 'images' => ['/images/Voltage Regulator.jpg']],
                ['name' => 'Oxygen Sensor', 'base_price' => 520, 'description' => 'O2 sensor for emissions control.', 'images' => ['/images/ECU Control Module.jpg']],
            ],
            'Accessories' => [
                ['name' => 'Floor Mat Set', 'base_price' => 450, 'description' => 'Custom-fit all-weather floor mats.', 'images' => ['/images/Floor Mats.jpg']],
                ['name' => 'Seat Cover', 'base_price' => 620, 'description' => 'Premium leather seat covers.', 'images' => ['/images/Car Seat Cover.jpg']],
                ['name' => 'Steering Cover', 'base_price' => 230, 'description' => 'Sport grip steering wheel cover.', 'images' => ['/images/Steering Wheel Cover.jpg']],
                ['name' => 'Rear Spoiler', 'base_price' => 850, 'description' => 'Aerodynamic rear spoiler wing.', 'images' => ['/images/Car Rear Spoiler.jpg']],
                ['name' => 'Roof Rack', 'base_price' => 1250, 'description' => 'Aluminum roof cargo carrier.', 'images' => ['/images/Roof Rack.jpg']],
                ['name' => 'LED Dome Light', 'base_price' => 145, 'description' => 'Interior LED upgrade kit.', 'images' => ['/images/LED Interior Dome Light.jpg']],
                ['name' => 'Mud Flaps', 'base_price' => 380, 'description' => 'Heavy-duty splash guards.', 'images' => ['/images/Mud Flaps.jpg']],
                ['name' => 'Air Freshener', 'base_price' => 65, 'description' => 'Long-lasting car fragrance.', 'images' => ['/images/Car Air Freshener.jpg']],
            ],
        ];

        return $products[$categoryName] ?? $products['Engine Parts'];
    }
}
