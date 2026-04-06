import axiosFetch from '@/libs/axiosConfig';

class Overview {
    static async getPageData(startDate:string,endDate:string) {
        const data = await axiosFetch<any>('GET', `/api/overview?startDate=${startDate}&endDate=${endDate}`, {});

        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status };
    }
}

export default Overview;
