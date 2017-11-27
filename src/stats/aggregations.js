import _ from 'lodash';

function groupItemsByRange(items, field, limitArray) {
  var results = _.map(limitArray, ()=>{return []});
  if (items) {
      _.forEach(items, (item) => {
        _.forEach(limitArray, (rankLimit, index) => {
          if (item[field] && item[field] < rankLimit) {
          results[index].push(item)
          return false;
          }
        })
      })
  }
  return results;
}

function getCountAggregation(groupedItems) {
  return _.mapValues(groupedItems, (x) => {
    return x.length;
  })
}

function average(items, field, includeZores){
  if (!includeZores) {
    var items = _.filter(items, (x) => {
      return x[field] && parseFloat(x[field])>=0
    });
  }

  return _.round(_.sumBy(items, (x) => {return parseFloat(x[field])}) / items.length, 2);
}

//Return for example tot total sales percentage of items with review count above 50, 200, 500 and 1000 getTotalFromIndex(1, 'reviewsCount', items)
function getTotalFromIndex(items, field, startIndex) {
  var value = 0;
  for (var i=startIndex; i<items.length;i++) {
    value += items[i][field];
  }
  return value;
}

//Gets an object with array of all reduced aggregation for each rank level
function getReducedAggregations(stats) {
   return _.map(stats.groupedBy.reviewsCount, (item, index) => {
    return {
      count: getTotalFromIndex(stats.groupedBy.reviewsCount, 'count', index),
      salesPercentage: getTotalFromIndex(stats.groupedBy.reviewsCount, 'percentageSales', index),
    }
   });
}
export default {
  average: average,
  groupItemsByRange: groupItemsByRange,
  getCountAggregation: getCountAggregation,
  getTotalFromIndex: getTotalFromIndex,
  getReducedAggregations: getReducedAggregations,
}