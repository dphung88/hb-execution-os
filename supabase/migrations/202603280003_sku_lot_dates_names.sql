-- Populate display names for all seeded SKUs in sku_lot_dates
-- Names sourced from ERP item catalog (erpSkuNames in lib/demo-data.ts)
update public.sku_lot_dates set name = 'HB Collagen Type 1,2&3 C/120V'     where code = 'HB001' and (name is null or name = '');
update public.sku_lot_dates set name = 'Glucollagen 7 in 1 C/30V'           where code = 'HB002' and (name is null or name = '');
update public.sku_lot_dates set name = 'Glucollagen 7 in 1 C/60V'           where code = 'HB003' and (name is null or name = '');
update public.sku_lot_dates set name = 'HB Glucosamine 3 in 1 C/200V'       where code = 'HB004' and (name is null or name = '');
update public.sku_lot_dates set name = 'HB Glucosamine 3 in 1 C/60V'        where code = 'HB005' and (name is null or name = '');
update public.sku_lot_dates set name = 'Gluta White C/30V'                  where code = 'HB006' and (name is null or name = '');
update public.sku_lot_dates set name = 'Slim Day C/60V'                     where code = 'HB007' and (name is null or name = '');
update public.sku_lot_dates set name = 'Slim Night C/30V'                   where code = 'HB008' and (name is null or name = '');
update public.sku_lot_dates set name = 'Omega 3.6.9 C/100V'                 where code = 'HB009' and (name is null or name = '');
update public.sku_lot_dates set name = 'HB Shark Cartilage 750mg C/100V'    where code = 'HB010' and (name is null or name = '');
update public.sku_lot_dates set name = 'Omega 3.6.9 C/200V'                 where code = 'HB011' and (name is null or name = '');
update public.sku_lot_dates set name = 'HB Cordy Extract C/60V'             where code = 'HB015' and (name is null or name = '');
update public.sku_lot_dates set name = 'HB Arginmilk Plus H/60V'            where code = 'HB018' and (name is null or name = '');
update public.sku_lot_dates set name = 'HB Liver Detox C/30V'               where code = 'HB020' and (name is null or name = '');
update public.sku_lot_dates set name = 'HB Calcidsoft H/30V'                where code = 'HB024' and (name is null or name = '');
update public.sku_lot_dates set name = 'HB Calcidsoft H/60V'                where code = 'HB025' and (name is null or name = '');
update public.sku_lot_dates set name = 'HB Vision Care C/30V'               where code = 'HB028' and (name is null or name = '');
update public.sku_lot_dates set name = 'HB Glutathion-C Plus H/30V'         where code = 'HB030' and (name is null or name = '');
update public.sku_lot_dates set name = 'HB CoQ10 150mg C/30V'               where code = 'HB031' and (name is null or name = '');
update public.sku_lot_dates set name = 'HB Prenatal Support H/60V'          where code = 'HB034' and (name is null or name = '');
update public.sku_lot_dates set name = 'HB Ginkgo Biloba 120mg C/30V'       where code = 'HB035' and (name is null or name = '');
update public.sku_lot_dates set name = 'HB Ginkgo Biloba 120mg H/60V'       where code = 'HB036' and (name is null or name = '');
update public.sku_lot_dates set name = 'HBGutcare C/30V'                    where code = 'HB037' and (name is null or name = '');
update public.sku_lot_dates set name = 'HBGutcare H/60V'                    where code = 'HB038' and (name is null or name = '');
update public.sku_lot_dates set name = 'HB Prenatal Support H/30V'          where code = 'HB039' and (name is null or name = '');
