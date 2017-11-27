import agg from './aggregations';
import _ from 'lodash';

export const getRankScore = (items, field, limitArray, reverseCalculation) => {
  var rank = reverseCalculation ? 100 : 0;
  var maxScore = 100;
  var scoringSystem = [];
  var groupedItems = agg.groupItemsByRange(items, field, limitArray);

  if (reverseCalculation) {
    for (let i = groupedItems.length - 1; i>0; i--) {
      var possibleScore = maxScore/(10 * (groupedItems.length - i));
      rank -= groupedItems[i].length * possibleScore;
    }
  } else {
    for (let i = 0; i < groupedItems.length; i++) {
      var possibleScore = maxScore/(10 * (i+1));
      rank += groupedItems[i].length * possibleScore;
    }
  }

  if (rank > 100) {
    rank = 100;
  }

  return _.round(rank);
}
