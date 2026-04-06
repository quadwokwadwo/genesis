import axiosFetch from '@/libs/axiosConfig';
import { CountryApiResponse, HospitalSettingsState, TCountryData } from '@/types/hospital';
import axios from 'axios';

class SettingService  {
    static async updateSetting(settings:HospitalSettingsState) {
        const data = await axiosFetch<HospitalSettingsState>('POST', `/api/settings`, { settings });
        return { operatedData: data.data.operatedData as HospitalSettingsState, status: data.status, operationalStatus: data.data.status };
    }

    static async getHospitalSetting() {
        const data = await axiosFetch<HospitalSettingsState>('GET', `/api/settings`, {});

        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status };
    }


    async getCurrencies(): Promise<TCountryData[]> {
        // const API_URL = 'https://restcountries.com/v3.1/all?fields=cca2,languages,currencies,name';

        try {
            // const response = await axios.get<CountryApiResponse[]>(API_URL);
            const response =await axios.get<CountryApiResponse[]>('../assets/data/countries.json').then((res) => res.data);
            // Transform raw data to country data
            const countryData = this.transformApiResponseToCountryData(response);

            // Sort alphabetically by country name
            return this.sortCountriesByName(countryData);
        } catch (error) {
            console.error('Failed to fetch country data:', error);
            return []
        }
    }

    private transformApiResponseToCountryData(countries: CountryApiResponse[]): TCountryData[] {
        return countries.map(country => {
            const countryCode = country.cca2;
            const language = Object.keys(country.languages || {})[0] || '';
            const currency = Object.keys(country.currencies || {})[0] || '';

            return {
                locale: `${language}-${countryCode}`,
                currency,
                countryName: country.name.common
            };
        });
    }

    private sortCountriesByName(countries: TCountryData[]): TCountryData[] {
        return [...countries].sort((a, b) =>
            a.countryName.localeCompare(b.countryName)
        );
    }
}
export default SettingService;
