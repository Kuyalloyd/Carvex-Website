<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // Create admin user only
        User::updateOrCreate(['email' => 'carvexcarparts@gmail.com'], [
            'name' => 'Admin User',
            'email' => 'carvexcarparts@gmail.com',
            'password' => bcrypt('admincarvex'),
            'role' => 'admin',
            'phone' => '09949904508',
            'address' => 'Agusan del norte',
            'city' => 'Butuan City',
            'region' => 'Caraga',
            'postal_code' => '8600',
        ]);

        // Create categories
        $categories = [
            ['name' => 'Engine Parts', 'slug' => 'engine-parts', 'description' => 'Engine components and parts'],
            ['name' => 'Brake Systems', 'slug' => 'brake-systems', 'description' => 'Brake pads, rotors, and systems'],
            ['name' => 'Suspension', 'slug' => 'suspension', 'description' => 'Suspension parts and components'],
            ['name' => 'Electrical Components', 'slug' => 'electrical-components', 'description' => 'Electrical parts and components'],
            ['name' => 'Accessories', 'slug' => 'accessories', 'description' => 'Car accessories and add-ons'],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }

        // Create products
        $products = [
            // Engine Parts
            ['name' => 'Oil Filter', 'slug' => 'oil-filter', 'brand' => 'Bosch', 'category_id' => 1, 'price' => 129.95, 'stock' => 50, 'description' => 'High-quality oil filter', 'vehicle_compatibility' => 'Toyota Corolla', 'images' => ['/images/oil filter.jpg'], 'is_active' => true],
            ['name' => 'Air Filter', 'slug' => 'air-filter', 'brand' => 'K&N', 'category_id' => 1, 'price' => 227.50, 'stock' => 30, 'description' => 'Reusable air filter', 'vehicle_compatibility' => 'Honda Civic', 'images' => ['/images/Air Filter.jpg'], 'is_active' => true],
            ['name' => 'Spark Plugs', 'slug' => 'spark-plugs', 'brand' => 'NGK', 'category_id' => 1, 'price' => 79.95, 'stock' => 100, 'description' => 'Set of 4 spark plugs', 'vehicle_compatibility' => 'Ford Focus', 'images' => ['/images/Spar plus.jpg'], 'is_active' => true],
            ['name' => 'Cabin Air Filter', 'slug' => 'cabin-air-filter', 'brand' => 'Mann-Filter', 'category_id' => 1, 'price' => 179.95, 'stock' => 40, 'description' => 'Premium cabin air filter', 'vehicle_compatibility' => 'Toyota Camry', 'images' => ['/images/Cabin Air Filter.jpg'], 'is_active' => true],
            ['name' => 'PCV Valve', 'slug' => 'pcv-valve', 'brand' => 'Bosch', 'category_id' => 1, 'price' => 149.95, 'stock' => 35, 'description' => 'Positive crankcase ventilation valve', 'vehicle_compatibility' => 'Honda Accord', 'images' => ['/images/PCV Valve.jpg'], 'is_active' => true],
            ['name' => 'Fuel Filter', 'slug' => 'fuel-filter', 'brand' => 'Fram', 'category_id' => 1, 'price' => 99.95, 'stock' => 45, 'description' => 'In-tank fuel filter', 'vehicle_compatibility' => 'Most models', 'images' => ['/images/Fuel Filter.jpg'], 'is_active' => true],
            ['name' => 'Engine Oil Synthetic', 'slug' => 'engine-oil-synthetic', 'brand' => 'Mobil', 'category_id' => 1, 'price' => 275.00, 'stock' => 60, 'description' => '5W-30 synthetic oil (5L)', 'vehicle_compatibility' => 'All models', 'images' => ['/images/Engine Oil (Synthetic).jpg'], 'is_active' => true],
            ['name' => 'Transmission Fluid', 'slug' => 'transmission-fluid', 'brand' => 'Valvoline', 'category_id' => 1, 'price' => 179.95, 'stock' => 25, 'description' => 'ATF transmission fluid', 'vehicle_compatibility' => 'Auto transmission cars', 'images' => ['/images/Transmission Fluid.jpg'], 'is_active' => true],
            ['name' => 'Coolant Radiator Fluid', 'slug' => 'coolant-fluid', 'brand' => 'Peak', 'category_id' => 1, 'price' => 94.95, 'stock' => 55, 'description' => '50/50 coolant mix', 'vehicle_compatibility' => 'All models', 'images' => ['/images/Coolant Radiator Fluid.jpg'], 'is_active' => true],
            ['name' => 'Serpentine Belt', 'slug' => 'serpentine-belt', 'brand' => 'Gates', 'category_id' => 1, 'price' => 229.95, 'stock' => 20, 'description' => 'Poly-V serpentine belt', 'vehicle_compatibility' => 'Multiple models', 'images' => ['/images/Serpentine Belt.jpg'], 'is_active' => true],
            
            // Brake Systems
            ['name' => 'Brake Pads', 'slug' => 'brake-pads', 'brand' => 'Brembo', 'category_id' => 2, 'price' => 425.00, 'stock' => 40, 'description' => 'Premium brake pads', 'vehicle_compatibility' => 'BMW 3 Series', 'images' => ['/images/Brake pads.jpg'], 'is_active' => true],
            ['name' => 'Brake Fluid', 'slug' => 'brake-fluid', 'brand' => 'Castrol', 'category_id' => 2, 'price' => 112.50, 'stock' => 60, 'description' => 'DOT 4 brake fluid', 'vehicle_compatibility' => 'All models', 'images' => ['/images/Brake Fluid.jpg'], 'is_active' => true],
            ['name' => 'Brake Rotor', 'slug' => 'brake-rotor', 'brand' => 'Akebono', 'category_id' => 2, 'price' => 600.00, 'stock' => 25, 'description' => 'Front brake rotor', 'vehicle_compatibility' => 'Mazda 3', 'images' => ['/images/Brake Rotor (Disc).jpg'], 'is_active' => true],
            ['name' => 'Ceramic Brake Pads Front', 'slug' => 'ceramic-brake-pads-front', 'brand' => 'Raybestos', 'category_id' => 2, 'price' => 475.00, 'stock' => 35, 'description' => 'Ceramic front brake pads', 'vehicle_compatibility' => 'Honda CR-V', 'images' => ['/images/Ceramic Brake Pads (Front).jpg'], 'is_active' => true],
            ['name' => 'Brake Caliper Front', 'slug' => 'brake-caliper-front', 'brand' => 'TRW', 'category_id' => 2, 'price' => 725.00, 'stock' => 15, 'description' => 'Front brake caliper assembly', 'vehicle_compatibility' => 'Toyota Camry', 'images' => ['/images/Brake Caliper (Front).jpg'], 'is_active' => true],
            ['name' => 'Brake Master Cylinder', 'slug' => 'brake-master-cylinder', 'brand' => 'Bosch', 'category_id' => 2, 'price' => 825.00, 'stock' => 10, 'description' => 'Brake master cylinder', 'vehicle_compatibility' => 'Ford Mustang', 'images' => ['/images/Brake Master Cylinder.jpg'], 'is_active' => true],
            ['name' => 'ABS Sensor', 'slug' => 'abs-sensor', 'brand' => 'Continental', 'category_id' => 2, 'price' => 375.00, 'stock' => 20, 'description' => 'ABS wheel speed sensor', 'vehicle_compatibility' => 'Multiple', 'images' => ['/images/ABS Sensor.jpg'], 'is_active' => true],
            ['name' => 'Brake Pads Rear', 'slug' => 'brake-pads-rear', 'brand' => 'Wagner', 'category_id' => 2, 'price' => 325.00, 'stock' => 40, 'description' => 'Rear brake pads', 'vehicle_compatibility' => 'Nissan Altima', 'images' => ['/images/Brake Pads (Rear).jpg'], 'is_active' => true],
            ['name' => 'Brake Hose Assembly', 'slug' => 'brake-hose', 'brand' => 'Genuine', 'category_id' => 2, 'price' => 275.00, 'stock' => 30, 'description' => 'Braided brake hose', 'vehicle_compatibility' => 'Universal', 'images' => ['/images/Brake Hose Assembly.jpg'], 'is_active' => true],
            ['name' => 'Brake Drum', 'slug' => 'brake-drum', 'brand' => 'Akebono', 'category_id' => 2, 'price' => 400.00, 'stock' => 18, 'description' => 'Rear brake drum', 'vehicle_compatibility' => 'Older vehicles', 'images' => ['/images/Brake Drum.jpg'], 'is_active' => true],
            
            // Suspension
            ['name' => 'Shock Absorber', 'slug' => 'shock-absorber', 'brand' => 'KYB', 'category_id' => 3, 'price' => 750.00, 'stock' => 20, 'description' => 'Front shock absorber', 'vehicle_compatibility' => 'Volkswagen Golf', 'images' => ['/images/Shock Absorber.jpg'], 'is_active' => true],
            ['name' => 'Suspension Spring', 'slug' => 'suspension-spring', 'brand' => 'Eibach', 'category_id' => 3, 'price' => 475.00, 'stock' => 35, 'description' => 'Lowering spring kit', 'vehicle_compatibility' => 'Multiple', 'images' => ['/images/Suspension Spring.jpg'], 'is_active' => true],
            ['name' => 'Control Arm', 'slug' => 'control-arm', 'brand' => 'Moog', 'category_id' => 3, 'price' => 550.00, 'stock' => 15, 'description' => 'Front control arm', 'vehicle_compatibility' => 'Hyundai Elantra', 'images' => ['/images/Control Arm.jpg'], 'is_active' => true],
            ['name' => 'Ball Joint', 'slug' => 'ball-joint', 'brand' => 'TRW', 'category_id' => 3, 'price' => 425.00, 'stock' => 25, 'description' => 'Front lower ball joint', 'vehicle_compatibility' => 'Honda Civic', 'images' => ['/images/Ball Joint.jpg'], 'is_active' => true],
            ['name' => 'Tie Rod End', 'slug' => 'tie-rod-end', 'brand' => 'Moog', 'category_id' => 3, 'price' => 225.00, 'stock' => 40, 'description' => 'Front tie rod end', 'vehicle_compatibility' => 'Ford Focus', 'images' => ['/images/Tie Rod End.jpg'], 'is_active' => true],
            ['name' => 'Sway Bar Link', 'slug' => 'sway-bar-link', 'brand' => 'KYB', 'category_id' => 3, 'price' => 275.00, 'stock' => 30, 'description' => 'Front sway bar link', 'vehicle_compatibility' => 'Toyota Corolla', 'images' => ['/images/Sway Bar Link.jpg'], 'is_active' => true],
            ['name' => 'Strut Assembly', 'slug' => 'strut-assembly', 'brand' => 'Monroe', 'category_id' => 3, 'price' => 925.00, 'stock' => 12, 'description' => 'Complete strut assembly', 'vehicle_compatibility' => 'Nissan Sentra', 'images' => ['/images/Strut Assembly.jpg'], 'is_active' => true],
            ['name' => 'Coil Spring', 'slug' => 'coil-spring', 'brand' => 'OEM', 'category_id' => 3, 'price' => 375.00, 'stock' => 25, 'description' => 'Front coil spring', 'vehicle_compatibility' => 'Multiple', 'images' => ['/images/Coil Spring.jpg'], 'is_active' => true],
            ['name' => 'Leaf Spring', 'slug' => 'leaf-spring', 'brand' => 'Multi-Leaf', 'category_id' => 3, 'price' => 600.00, 'stock' => 10, 'description' => 'Rear leaf spring pack', 'vehicle_compatibility' => 'Pickup trucks', 'images' => ['/images/Leaf Spring.jpg'], 'is_active' => true],
            ['name' => 'Stabilizer Bar', 'slug' => 'stabilizer-bar', 'brand' => 'Hellwig', 'category_id' => 3, 'price' => 475.00, 'stock' => 15, 'description' => 'Heavy duty stabilizer bar', 'vehicle_compatibility' => 'SUVs', 'images' => ['/images/Stabilizer Bar.jpg'], 'is_active' => true],
            
            // Electrical Components
            ['name' => 'Alternator', 'slug' => 'alternator', 'brand' => 'Bosch', 'category_id' => 4, 'price' => 1250.00, 'stock' => 10, 'description' => '120A alternator', 'vehicle_compatibility' => 'Nissan Altima', 'images' => ['/images/Alternator.jpg'], 'is_active' => true],
            ['name' => 'Car Battery', 'slug' => 'car-battery', 'brand' => 'Optima', 'category_id' => 4, 'price' => 900.00, 'stock' => 20, 'description' => '80Ah car battery', 'vehicle_compatibility' => 'Most cars', 'images' => ['/images/Car Battery.jpg'], 'is_active' => true],
            ['name' => 'Starter Motor', 'slug' => 'starter-motor', 'brand' => 'Denso', 'category_id' => 4, 'price' => 1000.00, 'stock' => 12, 'description' => 'Heavy duty starter', 'vehicle_compatibility' => 'Subaru Outback', 'images' => ['/images/Starter Motor.jpg'], 'is_active' => true],
            ['name' => 'Voltage Regulator', 'slug' => 'voltage-regulator', 'brand' => 'Motorcraft', 'category_id' => 4, 'price' => 325.00, 'stock' => 18, 'description' => 'Voltage regulator', 'vehicle_compatibility' => 'Ford vehicles', 'images' => ['/images/Voltage Regulator.jpg'], 'is_active' => true],
            ['name' => 'LED Headlight Bulbs', 'slug' => 'led-headlight-bulbs', 'brand' => 'Sylvania', 'category_id' => 4, 'price' => 225.00, 'stock' => 30, 'description' => 'H7 LED headlight bulbs', 'vehicle_compatibility' => 'Most vehicles', 'images' => ['/images/LED Headlight Bulbs.jpg'], 'is_active' => true],
            ['name' => 'Tail Light Bulb', 'slug' => 'tail-light-bulb', 'brand' => 'PIAA', 'category_id' => 4, 'price' => 75.00, 'stock' => 50, 'description' => 'Red tail light bulb', 'vehicle_compatibility' => 'Universal', 'images' => ['/images/Tail Light Bulb.jpg'], 'is_active' => true],
            ['name' => 'Wiper Blade Assembly', 'slug' => 'wiper-blade', 'brand' => 'Bosch', 'category_id' => 4, 'price' => 175.00, 'stock' => 40, 'description' => 'Front wiper blade', 'vehicle_compatibility' => 'Most models', 'images' => ['/images/Wiper Blade Assembly.jpg'], 'is_active' => true],
            ['name' => 'ECU Control Module', 'slug' => 'ecu-module', 'brand' => 'OEM', 'category_id' => 4, 'price' => 1750.00, 'stock' => 5, 'description' => 'Engine control unit', 'vehicle_compatibility' => 'Toyota Camry 2015', 'images' => ['/images/ECU Control Module.jpg'], 'is_active' => true],
            ['name' => 'Battery Cable', 'slug' => 'battery-cable', 'brand' => 'Genuine', 'category_id' => 4, 'price' => 125.00, 'stock' => 35, 'description' => 'Positive/Negative battery cable', 'vehicle_compatibility' => 'Universal', 'images' => ['/images/Battery Cable.jpg'], 'is_active' => true],
            ['name' => 'Fuse Box', 'slug' => 'fuse-box', 'brand' => 'OEM', 'category_id' => 4, 'price' => 475.00, 'stock' => 8, 'description' => 'Main fuse box module', 'vehicle_compatibility' => 'Honda Civic', 'images' => ['/images/Fuse Box.jpg'], 'is_active' => true],
            
            // Accessories
            ['name' => 'Floor Mats', 'slug' => 'floor-mats', 'brand' => 'WeatherTech', 'category_id' => 5, 'price' => 425.00, 'stock' => 45, 'description' => 'All-weather floor mats', 'vehicle_compatibility' => 'Multiple', 'images' => ['/images/Floor Mats.jpg'], 'is_active' => true],
            ['name' => 'Car Seat Cover', 'slug' => 'car-seat-cover', 'brand' => 'Prestige', 'category_id' => 5, 'price' => 600.00, 'stock' => 30, 'description' => 'Premium seat covers', 'vehicle_compatibility' => 'Universal', 'images' => ['/images/Car Seat Cover.jpg'], 'is_active' => true],
            ['name' => 'Steering Wheel Cover', 'slug' => 'steering-wheel-cover', 'brand' => 'Sparco', 'category_id' => 5, 'price' => 225.00, 'stock' => 50, 'description' => 'Racing steering wheel cover', 'vehicle_compatibility' => 'Universal', 'images' => ['/images/Steering Wheel Cover.jpg'], 'is_active' => true],
            ['name' => 'Car Rear Spoiler', 'slug' => 'car-rear-spoiler', 'brand' => 'ABS', 'category_id' => 5, 'price' => 825.00, 'stock' => 12, 'description' => 'ABS rear spoiler/wing', 'vehicle_compatibility' => 'Multiple', 'images' => ['/images/Car Rear Spoiler.jpg'], 'is_active' => true],
            ['name' => 'Roof Rack', 'slug' => 'roof-rack', 'brand' => 'Thule', 'category_id' => 5, 'price' => 1225.00, 'stock' => 8, 'description' => 'Aluminum roof rack cargo carrier', 'vehicle_compatibility' => 'Most SUVs', 'images' => ['/images/Roof Rack.jpg'], 'is_active' => true],
            ['name' => 'LED Interior Dome Light', 'slug' => 'led-dome-light', 'brand' => 'AEVA', 'category_id' => 5, 'price' => 140.00, 'stock' => 25, 'description' => 'Interior LED dome light kit', 'vehicle_compatibility' => 'Universal', 'images' => ['/images/LED Interior Dome Light.jpg'], 'is_active' => true],
            ['name' => 'Mud Flaps', 'slug' => 'mud-flaps', 'brand' => 'Bushwacker', 'category_id' => 5, 'price' => 375.00, 'stock' => 20, 'description' => 'Premium mud flaps set', 'vehicle_compatibility' => 'Trucks/SUVs', 'images' => ['/images/Mud Flaps.jpg'], 'is_active' => true],
            ['name' => 'Car Air Freshener', 'slug' => 'car-air-freshener', 'brand' => 'Febreze', 'category_id' => 5, 'price' => 60.00, 'stock' => 100, 'description' => 'Premium car air freshener', 'vehicle_compatibility' => 'All cars', 'images' => ['/images/Car Air Freshener.jpg'], 'is_active' => true],
            ['name' => 'Door Lock Protector', 'slug' => 'door-lock-protector', 'brand' => 'Dorman', 'category_id' => 5, 'price' => 175.00, 'stock' => 30, 'description' => 'Door lock ice guards', 'vehicle_compatibility' => 'Universal', 'images' => ['/images/Door Lock Protector.jpg'], 'is_active' => true],
            ['name' => 'Bumper Protector', 'slug' => 'bumper-protector', 'brand' => 'Careless', 'category_id' => 5, 'price' => 275.00, 'stock' => 15, 'description' => 'Black bumper protector', 'vehicle_compatibility' => 'Most models', 'images' => ['/images/Bumper Protector.jpg'], 'is_active' => true],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}

