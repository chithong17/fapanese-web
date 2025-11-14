import axios from "axios";

const API_URL = "https://85e7dd680e50.ngrok-free.app/fapanese/api";

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