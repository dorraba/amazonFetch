/**
 * Created by dorr on 21/10/2016.
 */
import _ from 'lodash';
import {categoriesFirstPositionRank, monthlySalesAmountMultipliers} from './consts/salesData';

var salesDiffsCache = {};

function generatesalesDiffsForCategory(country, category){
  let countryCateogoryCache = _.get(salesDiffsCache, `[${country}][${category}]`)
    if (countryCateogoryCache){
        return countryCateogoryCache;
    }

    var salesDiffs = {};

    var categoryFirstPlaceRank = _.get(categoriesFirstPositionRank, `[${country}][${category}]`);
    if (!categoryFirstPlaceRank)
        return null;

    var keys = _.chain(monthlySalesAmountMultipliers)
                .keys()
                .map(key => _.toString(key))
                .value();
    for (var i=0;i<keys.length;i++){
        salesDiffs[keys[i]] = monthlySalesAmountMultipliers[keys[i]] * categoryFirstPlaceRank;
    }
    _.set(salesDiffsCache, `[${country}][${category}]`, salesDiffs);
    return salesDiffs;
  }

export const getMothlySalesForRank = (country, category, salesRank) => {
  if (!salesRank || salesRank== 0) return null;
  var salesDiffs = generatesalesDiffsForCategory(country, category);
  const firstPlacePositionRank = _.get(categoriesFirstPositionRank, `[${country}][${category}]`);
  if (!firstPlacePositionRank) {
    return null;
  }

  if (!salesDiffs) return null;
  if (salesRank == 1){
    return firstPlacePositionRank;
  }

  var substruct = 0;
  var keys = Object.keys(salesDiffs);
  for (var x in salesDiffs){
      var keyIndex =keys.indexOf(x);
      var nextLevel = _.toNumber(keys[keyIndex+1]);
      if (nextLevel && salesRank>nextLevel){
          substruct += ((nextLevel - x) * salesDiffs[x]);
      }
      else {
          substruct+= ((salesRank - x) * salesDiffs[x])
          if (substruct > firstPlacePositionRank) {
              return 0;
          }
          break;
      }
  }

  return _.round(firstPlacePositionRank - substruct);
}