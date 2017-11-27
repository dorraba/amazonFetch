import {serverHost, defaultCountry} from './consts/config';
import URI from 'urijs';
import _ from 'lodash';
import {parseString} from 'xml2js-parser';
import cheerio from 'cheerio';
import htmlParser from './htmlParser';
import {getMothlySalesForRank} from './salesCalc';

export const generateUrl = (search, page = 0, country = defaultCountry) => {
  return Promise.resolve(new URI(`${serverHost}generate`)
          .search({search, page, country}).href());
}

export const getAmazonApiSignedUrls = async (requestUrl) => {
  const result = await fetch(requestUrl);
  const urls = await result.json()
  return _.map(urls, (url) => url.replace("http://", "https://"))
}

export const getItemsFromAmazonApi = async (urls) => {
  const resultsFetch = await Promise.all(_.map(urls, fetch));
  return Promise.all(_.map(resultsFetch, (result) => result.text()))
}

export const parseAmazonApiXmlToJson = (rawDataPages) => {
  return Promise.all(_.map(rawDataPages, (rawData) => {
    return new Promise((resolve, reject) => {
      parseString(rawData, {strict: false, trim: true, normalizeTags: true}, function (err, parsed) {
        err ? reject(err) : resolve(_.get(parsed, 'itemsearchresponse.items[0].item'));
      });
    })
  }))
}

export const parseAmazonJsonObjects = (rawItems) => {
  rawItems = _.flatten(rawItems);
  return _.map(rawItems, (rawItem, index) => {
    const attributes = _.get(rawItem, 'itemattributes[0]');
    const dimensions = _.get(attributes, 'packagedimensions[0]') || _.get(attributes, 'itemdimensions[0]');

    return {
      index,
      asin: _.get(rawItem, 'asin[0]'),
      image: _.get(rawItem, 'smallimage[0].url[0]'),
      largeImage: _.get(rawItem, 'largeimage[0].url[0]'),
      url: _.get(rawItem, 'detailpageurl[0]'),
      lowestPrice: _.chain(rawItem)
                    .get('offersummary[0].lowestnewprice[0].formattedprice[0]')
                    .replace('$', '')
                    .replace(',', '')
                    .toNumber()
                    .value(),

      brand: _.get(attributes, 'brand[0]'),
      label: _.get(attributes, 'label[0]'),
      quantity: _.get(attributes, 'packagequantity[0]'),
      category: _.get(attributes, 'productgroup[0]'),
      title: _.get(attributes, 'title[[0]'),
      dimensions: _.chain(['height', 'width', 'length', 'weight'])
                    .keyBy()
                    .mapValues((dimensionAttr) => {
                      return {
                        value: _.toNumber(_.get(dimensions, `${dimensionAttr}[0]._`)),
                        unit: _.get(dimensions, `${dimensionAttr}[0].$.UNITS`)
                      }
                    }).value(),
      }
  })
}

export const fillSellersDataFromAmazon = (items, country, pingCallback = _.noop) => {
  return Promise.all(_.map(items, async (item, index) => {
    const result = await fetch(item.url,  {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36',
      }
    });
    const html = await result.text();

    const $ = cheerio.load(_.toLower(html));
    let resultItem = _.chain({
        ...item,
        reviewsCount: htmlParser.getReviewsCount($),
        reviewsRatings: htmlParser.getRatings($),
        ...htmlParser.getSalesRankData($),
        fulfillment: htmlParser.getFulfillmenet($),
        buyBox: htmlParser.getBuyBoxSellers($),
      })
      .pickBy(_.identity)
      .value();

      resultItem = {
      ...resultItem,
      ...fillSalesAmount(country, resultItem)
    }
    //Code for pinging that finished processing item
    const itemIndex = _.findIndex(items, {'asin': resultItem.asin})
    items.splice(itemIndex, 1, resultItem);
    pingCallback(items);

    return resultItem;
  }))
}


export const fillSalesAmount = (country, item) => {
  try {
    const monthlySalesAmount = _.round(getMothlySalesForRank(country, item.category, item.salesRank));
    const canCalculateRevenue = monthlySalesAmount && item.lowestPrice;
    monthlyRevenue = canCalculateRevenue ? _.round(monthlySalesAmount * item.lowestPrice) : 0;

    return {
      monthlyRevenue,
      monthlySalesAmount
    };
  } catch (e) {
    return {}
  }
}

class AmazonService {
  find = async (search, options = {}, pingCallback) => {
    const {page = 1, country = 'us'} = options;
    return await generateUrl(search, page)
                  .then(getAmazonApiSignedUrls)
                  .then(getItemsFromAmazonApi)
                  .then(parseAmazonApiXmlToJson)
                  .then(parseAmazonJsonObjects)
                  .then((x) => {
                    pingCallback(x);
                    return fillSellersDataFromAmazon(x, country, pingCallback)
                  })
  }

  autocomplete = async (query) => {
    query = _.toLower(query);
    if (query.length < 2) {
      return [];
    }
    const rawDataFetch = await fetch(`https://completion.amazon.com/search/complete?method=completion&mkt=1&p=Search&l=en_US&sv=desktop&client=amazon-search-ui&x=String&search-alias=aps&q=${query}&qs=&cf=1&fb=1&sc=1&`)
    const rawData = await rawDataFetch.text();

    const results = (() => {
      let completion;
      eval(rawData);
      return completion;
    })();

    return _.get(results, '[1]') || [];
  }
}
export default new AmazonService();