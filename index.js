import amazon from './src/amazon';
import {getTrends} from './src/googleTrends';

export const find = amazon.find; //async (search, options = {}, pingCallback)
export const autocomplete = amazon.autocomplete; //async (query)
export const trends = getTrends; //async (query, country)