import _ from 'lodash';
import agg from './aggregations';

export default (groupedItems, items, preserveKeys) => {
  return _[preserveKeys ? 'mapValues':'map'](groupedItems, (g) => {
    return {
//      g: g,
      count: g.length,
      totalMonthlySales: _.sumBy(g, 'monthlySalesAmount'),
      totalMonthlyRevenue: _.sumBy(g, 'monthlyRevenue'),
      averageMonthlySales: g.length == 0 ? 0 : _.round(_.sumBy(g, 'monthlySalesAmount') / g.length),
      averageMonthlyRevenue: g.length == 0 ? 0 : _.round(_.sumBy(g, 'monthlyRevenue') / g.length),
      percentageCount: _.round((g.length * 100) / items.length),
      percentageSales: _.round((_.sumBy(g, 'monthlySalesAmount') * 100) / _.sumBy(items, 'monthlySalesAmount')),
      percentageRevenue: _.round((_.sumBy(g, 'monthlyRevenue') * 100) / _.sumBy(items, 'monthlyRevenue')),
    };
 })
}