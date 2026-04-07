import axios from "axios";

const API_URL = "https://fapanese-backend-production.up.railway.app/fapanese/api";

// Giả định endpoint cho overview parts
export const getOverviewPartsByOverview = async (overviewId: number) => {
  const token = localStorage.getItem("token");
  const res = await axios.get(
    `${API_URL}/overview-parts/by-overview/${overviewId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data.result;
};