<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Si ya existe el archivo SQL, lo ejecutamos primero
        if (file_exists(database_path('sql/productos.sql'))) {
            DB::unprepared(file_get_contents(database_path('sql/productos.sql')));
        }

        // Productos adicionales


        // Generar códigos automáticamente
        // $this->createProductsWithAutoCode($additionalProducts);
    }

    /**
     * Crear productos con código automático
     */
    private function createProductsWithAutoCode(array $products)
    {
        // Obtener el último código
        $lastProduct = Product::orderBy('code', 'desc')->first();
        $currentCode = $lastProduct ? $lastProduct->code : 0;

        $createdCount = 0;
        $skippedCount = 0;

        foreach ($products as $productData) {
            try {
                // Verificar si el producto ya existe
                $exists = Product::where('machine', strtoupper($productData['machine']))
                    ->where('brand', strtoupper($productData['brand']))
                    ->where('model', strtoupper($productData['model']))
                    ->exists();

                if (!$exists) {
                    $currentCode++;
                    $productData['code'] = $currentCode;

                    // Asegurar que todos los campos estén en mayúsculas
                    $productData['machine'] = strtoupper($productData['machine']);
                    $productData['brand'] = strtoupper($productData['brand']);
                    $productData['model'] = strtoupper($productData['model']);
                    $productData['level'] = strtoupper($productData['level']);

                    Product::create($productData);
                    $this->command->info("✅ Producto creado: {$productData['machine']} - {$productData['brand']} - {$productData['model']} (Código: {$currentCode})");
                    $createdCount++;
                } else {
                    $this->command->warn("⏭️  Producto ya existe: {$productData['machine']} - {$productData['brand']} - {$productData['model']}");
                    $skippedCount++;
                }
            } catch (\Exception $e) {
                $this->command->error("❌ Error creando producto {$productData['machine']}: " . $e->getMessage());
            }
        }

        $this->command->info("\n📊 Resumen:");
        $this->command->info("✅ Productos creados: {$createdCount}");
        $this->command->info("⏭️  Productos omitidos (ya existían): {$skippedCount}");
        $this->command->info("📦 Total procesados: " . ($createdCount + $skippedCount));
    }
}
