## Introducción

Dada la consulta:

```sql
SELECT ClienteId, Fecha, Total,
  ROW_NUMBER() OVER (PARTITION BY ClienteId
                        ORDER BY Fecha DESC) AS rn,
  RANK() OVER (ORDER BY Total DESC) AS ranking,
  SUM(Total) OVER (PARTITION BY ClienteId
                      ORDER BY Fecha
                      ROWS UNBOUNDED PRECEDING) AS acumulado,
  LAG(Total) OVER (PARTITION BY ClienteId
                    ORDER BY Fecha) AS anterior
FROM dbo.Pedido;
```

Resultado:

| ClienteId | Fecha | Total | rn | ranking | acumulado | anterior | Nota de comportamiento |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| 1 | 2026-01-01 | **\$100.00** | 3 | 45 | **\$100.00** | *NULL* | Primer pedido. Acumulado base. `anterior` es NULL. |
| 1 | 2026-01-15 | **\$150.00** | 2 | 22 | **\$250.00** | **\$100.00** | Suma \$100+\$150 = \$250. Lee el total del pedido previo (\$100). |
| 1 | 2026-02-01 | **\$200.00** | **1** | 10 | **\$450.00** | **\$150.00** | Es el pedido más nuevo, por eso obtiene el `rn = 1`. |
