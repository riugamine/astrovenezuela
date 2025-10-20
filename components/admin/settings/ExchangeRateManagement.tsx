"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDollarSign,
  faExchangeAlt,
  faHistory,
  faInfoCircle,
  faSave,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { ExchangeRate } from "@/lib/types/database.types";
import { getActiveExchangeRate, getExchangeRateHistory } from "@/lib/data/exchange-rates";
import { createExchangeRateAction } from "@/lib/data/admin/actions/exchange-rates";
import { getCalculationExample } from "@/lib/utils/currency-converter";

// Form validation schema
const exchangeRateSchema = z.object({
  bcvRate: z
    .number({ required_error: "BCV rate is required", invalid_type_error: "BCV rate must be a valid number" })
    .positive("BCV rate must be greater than 0")
    .max(10000, "BCV rate seems too high"),
  blackMarketRate: z
    .number({ required_error: "Black market rate is required", invalid_type_error: "Black market rate must be a valid number" })
    .positive("Black market rate must be greater than 0")
    .max(10000, "Black market rate seems too high"),
}).refine((data) => data.blackMarketRate >= data.bcvRate, {
  message: "Black market rate should typically be higher than BCV rate",
  path: ["blackMarketRate"],
});

type ExchangeRateFormData = z.infer<typeof exchangeRateSchema>;

/**
 * Component for managing exchange rates in the admin panel
 * Allows admins to view current rates, update them, and see calculation examples
 */
export default function ExchangeRateManagement() {
  const [activeRate, setActiveRate] = useState<ExchangeRate | null>(null);
  const [history, setHistory] = useState<ExchangeRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ExchangeRateFormData>({
    resolver: zodResolver(exchangeRateSchema),
    defaultValues: {
      bcvRate: 0,
      blackMarketRate: 0,
    },
  });

  const loadExchangeRateData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [activeRateData, historyData] = await Promise.all([
        getActiveExchangeRate(),
        getExchangeRateHistory(),
      ]);

      setActiveRate(activeRateData);
      setHistory(historyData);

      // Update form with current rates if they exist
      if (activeRateData) {
        form.setValue("bcvRate", activeRateData.bcv_rate);
        form.setValue("blackMarketRate", activeRateData.black_market_rate);
      }
    } catch (error) {
      console.error("Error loading exchange rate data:", error);
      toast.error("Error al cargar las tasas de cambio");
    } finally {
      setIsLoading(false);
    }
  }, [form]);

  // Load initial data
  useEffect(() => {
    loadExchangeRateData();
  }, [loadExchangeRateData]);

  const onSubmit = async (data: ExchangeRateFormData) => {
    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("bcvRate", data.bcvRate.toString());
      formData.append("blackMarketRate", data.blackMarketRate.toString());

      const result = await createExchangeRateAction(formData);

      if (result.success) {
        toast.success(result.message || "Tasas de cambio actualizadas exitosamente");
        await loadExchangeRateData(); // Reload data
      } else {
        toast.error(result.error || "Error al actualizar las tasas de cambio");
      }
    } catch (error) {
      console.error("Error updating exchange rates:", error);
      toast.error("Error al actualizar las tasas de cambio");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-6">
          <FontAwesomeIcon icon={faSpinner} className="h-6 w-6 animate-spin mr-2" />
          Cargando tasas de cambio...
        </CardContent>
      </Card>
    );
  }

  const calculationExample = activeRate ? getCalculationExample(activeRate) : null;

  return (
    <div className="space-y-6">
      {/* Current Rates Display */}
      <Card>
        <CardHeader className="py-6">
          <CardTitle className="flex items-center gap-2">
            <FontAwesomeIcon icon={faExchangeAlt} className="h-5 w-5" />
            Tasas de Cambio Actuales
          </CardTitle>
        </CardHeader>
        <CardContent className="py-6">
          {activeRate ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {activeRate.bcv_rate.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">BCV (Oficial)</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {activeRate.black_market_rate.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Dólar Negro</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {((activeRate.black_market_rate / activeRate.bcv_rate - 1) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Diferencia</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <FontAwesomeIcon icon={faInfoCircle} className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No hay tasas de cambio configuradas</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Update Rates Form */}
      <Card>
        <CardHeader className="py-6">
          <CardTitle>Actualizar Tasas de Cambio</CardTitle>
        </CardHeader>
        <CardContent className="py-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bcvRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tasa BCV (Oficial)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="205.68"
                          value={field.value === undefined || field.value === null ? '' : field.value}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || value === '.') {
                              field.onChange(0);
                            } else {
                              const numValue = parseFloat(value);
                              if (!isNaN(numValue)) {
                                field.onChange(numValue);
                              }
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="blackMarketRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tasa Dólar Negro</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="300.00"
                          value={field.value === undefined || field.value === null ? '' : field.value}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || value === '.') {
                              field.onChange(0);
                            } else {
                              const numValue = parseFloat(value);
                              if (!isNaN(numValue)) {
                                field.onChange(numValue);
                              }
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 animate-spin mr-2" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} className="h-4 w-4 mr-2" />
                    Actualizar Tasas
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Calculation Example */}
      {calculationExample && (
        <Card>
          <CardHeader className="py-6">
            <CardTitle className="flex items-center gap-2">
              <FontAwesomeIcon icon={faDollarSign} className="h-5 w-5" />
              Ejemplo de Cálculo
            </CardTitle>
          </CardHeader>
          <CardContent className="py-6">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Con las tasas actuales, un producto con precio referencial de{" "}
                <strong>${calculationExample.referencePrice}</strong> se calcularía así:
              </div>
              
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Precio USD al público:</span>
                  <span className="font-mono">
                    (${calculationExample.referencePrice} × {calculationExample.blackMarketRate.toLocaleString()}) ÷ {calculationExample.bcvRate.toLocaleString()} = ${calculationExample.usdPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Precio VES:</span>
                  <span className="font-mono">
                    ${calculationExample.usdPrice.toFixed(2)} × {calculationExample.bcvRate.toLocaleString()} = {calculationExample.vesPrice.toLocaleString()} VES
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Resultado:</span>
                  <span className="text-primary">{calculationExample.formattedResult}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* History Table */}
      <Card>
        <CardHeader className="py-6">
          <CardTitle className="flex items-center gap-2">
            <FontAwesomeIcon icon={faHistory} className="h-5 w-5" />
            Historial de Cambios
          </CardTitle>
        </CardHeader>
        <CardContent className="py-6">
          {history.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>BCV</TableHead>
                  <TableHead>Dólar Negro</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((rate) => (
                  <TableRow key={rate.id}>
                    <TableCell>
                      {new Date(rate.created_at).toLocaleString("es-VE")}
                    </TableCell>
                    <TableCell>{rate.bcv_rate.toLocaleString()}</TableCell>
                    <TableCell>{rate.black_market_rate.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={rate.is_active ? "default" : "secondary"}>
                        {rate.is_active ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No hay historial de cambios disponible
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
