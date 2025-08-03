import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());

// CoinGecko 스테이블코인 가격 API 엔드포인트
app.get('/api/stablecoin-prices', async (req, res) => {
  try {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price',
      {
        params: {
          ids: 'true-usd,dai,gemini-dollar',
          vs_currencies: 'krw',
          include_24hr_change: 'true'
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('CoinGecko API 오류:', error.message);
    res.status(500).json({ error: 'CoinGecko API에서 데이터를 가져오는 데 실패했습니다.' });
  }
});

// 금융위원회 금 가격 API 엔드포인트
app.get('/api/gold-price', async (req, res) => {
  const serviceKey = process.env.GOLD_API_KEY;
  if (!serviceKey) {
    return res.status(500).json({ error: '금 시세 API 키가 설정되지 않았습니다.' });
  }

  const basDt = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const apiUrl = `https://apis.data.go.kr/1160100/service/GetGeneralProductInfoService/getGeneralProductInfo`;

  try {
    const response = await axios.get(apiUrl, {
      params: {
        serviceKey: decodeURIComponent(serviceKey),
        numOfRows: 10,
        pageNo: 1,
        resultType: 'json',
        basDt: basDt
      }
    });
    
    if (response.data?.response?.body?.items) {
      const items = response.data.response.body.items.item || [];
      const goldItem = items.find(item => item.itmsNm?.includes('금'));
      if (goldItem?.clpr) {
        res.json({ price: parseFloat(goldItem.clpr) });
      } else {
        res.status(404).json({ error: '오늘의 금 시세 정보를 찾을 수 없습니다.' });
      }
    } else {
      // API가 예상치 못한 구조의 응답을 보낼 경우
      console.error('금융위원회 API 응답 구조 오류:', response.data);
      res.status(500).json({ error: '금 시세 정보의 응답 형식이 올바르지 않습니다.' });
    }
  } catch (error) {
    console.error('금융위원회 API 오류:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: '금융위원회 API에서 데이터를 가져오는 데 실패했습니다.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행중입니다`);
});