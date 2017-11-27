
import googleTrends from 'google-trends-api';
import _ from 'lodash'

export const getTrends = async (query, country) => {
  try{
    return [];
    const result = await googleTrends.interestOverTime({keyword: query, geo: _.toUpper(country)})
    console.log(result);
    var trends = _.chain(result)
                  .thru(JSON.parse)
                  .get('default.timelineData')
                  .map((x) => ({
                    name: x.formattedTime,
                    value: _.get(x, 'value[0]'),
                  })).value()
    return trends;
  } catch (e) {
    return e;
  }
}