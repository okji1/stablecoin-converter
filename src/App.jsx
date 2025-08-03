import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import axios from 'axios';
import KrwToCoin from './KrwToCoin';
import CoinToKrw from './CoinToKrw';
import './App.css';

// 업비트에서 가져올 주요 코인 목록
const UPBIT_MARKETS = [
  'KRW-BTC',
  'KRW-ETH',
  'KRW-XRP',
  'KRW-SOL',
  'KRW-DOGE',
  'KRW-TRX',
  'KRW-ADA',
  'KRW-USDT',
  'KRW-USDC'
];

function App() {
  // API 관련 상태
  const [stablecoinData, setStablecoinData] = useState({});
  const [upbitData, setUpbitData] = useState({});
  const [goldPrice, setGoldPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const location = useLocation();

  // localStorage에서 저장된 데이터 로드
  const loadSavedData = () => {
    try {
      const savedStablecoin = localStorage.getItem('stablecoinData');
      const savedUpbit = localStorage.getItem('upbitData');
      const savedGold = localStorage.getItem('goldPrice');
      const savedLastUpdated = localStorage.getItem('lastUpdated');
      
      if (savedStablecoin) setStablecoinData(JSON.parse(savedStablecoin));
      if (savedUpbit) setUpbitData(JSON.parse(savedUpbit));
      if (savedGold) setGoldPrice(parseFloat(savedGold));
      if (savedLastUpdated) setLastUpdated(new Date(savedLastUpdated));
      
      if (savedStablecoin || savedUpbit) {
        setLoading(false);
        console.log('💾 저장된 데이터를 로드했습니다');
      }
    } catch (err) {
      console.error('저장된 데이터 로드 실패:', err);
    }
  };

  // localStorage에 데이터 저장
  const saveDataToStorage = (stablecoin, upbit, gold) => {
    try {
      localStorage.setItem('stablecoinData', JSON.stringify(stablecoin));
      localStorage.setItem('upbitData', JSON.stringify(upbit));
      localStorage.setItem('goldPrice', gold?.toString() || '90000');
      localStorage.setItem('lastUpdated', new Date().toISOString());
      console.log('💾 데이터를 저장했습니다');
    } catch (err) {
      console.error('데이터 저장 실패:', err);
    }
  };

  // 모든 API 데이터 가져오기
  const fetchAllData = async () => {
    try {
      setError(null);
      console.log('🔄 새로운 데이터를 가져오는 중...');
      
      const [stablecoinResult, upbitResult, goldResult] = await Promise.allSettled([
        fetchStablecoinPrices(),
        fetchUpbitPrices(),
        fetchGoldPrice()
      ]);
      
      let newStablecoin = {};
      if (stablecoinResult.status === 'fulfilled') {
        newStablecoin = { ...newStablecoin, ...stablecoinResult.value };
      }
      
      let newUpbit = {};
      if (upbitResult.status === 'fulfilled') {
        const { stablecoinFromUpbit, normalCoins } = upbitResult.value;
        newStablecoin = { ...newStablecoin, ...stablecoinFromUpbit };
        newUpbit = normalCoins;
      }
      
      const newGold = goldResult.status === 'fulfilled' ? goldResult.value : (goldPrice || 90000);
      
      setStablecoinData(newStablecoin);
      setUpbitData(newUpbit);
      setGoldPrice(newGold);
      setLastUpdated(new Date());
      
      saveDataToStorage(newStablecoin, newUpbit, newGold);
      
      console.log('✅ 데이터 업데이트 완료');
      
    } catch (err) {
      console.error('데이터 가져오기 실패:', err);
      setError('일부 데이터를 불러올 수 없습니다. 저장된 데이터를 사용합니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedData();
    fetchAllData();
    const intervalId = setInterval(fetchAllData, 10 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  const fetchStablecoinPrices = async () => {
    const response = await axios.get('http://localhost:3001/api/stablecoin-prices');
    const prices = {};
    const data = response.data;

    if (data['true-usd']) {
      prices['TUSD'] = {
        price: data['true-usd'].krw,
        change: data['true-usd'].krw_24h_change || 0,
        source: 'coingecko'
      };
    }
    if (data['dai']) {
      prices['DAI'] = {
        price: data['dai'].krw,
        change: data['dai'].krw_24h_change || 0,
        source: 'coingecko'
      };
    }
    if (data['gemini-dollar']) {
      prices['GUSD'] = {
        price: data['gemini-dollar'].krw,
        change: data['gemini-dollar'].krw_24h_change || 0,
        source: 'coingecko'
      };
    }
    return prices;
  };

  const fetchUpbitPrices = async () => {
    const marketStr = UPBIT_MARKETS.join(',');
    const response = await axios.get(
      `https://api.upbit.com/v1/ticker?markets=${marketStr}`
    );
    
    const prices = {};
    response.data.forEach((item) => {
      const symbol = item.market.replace('KRW-', '');
      prices[symbol] = { price: item.trade_price, source: 'upbit' };
    });
    
    const orderedPrices = {};
    UPBIT_MARKETS.forEach(market => {
      const symbol = market.replace('KRW-', '');
      if (prices[symbol]) {
        orderedPrices[symbol] = prices[symbol];
      }
    });

    const stablecoinFromUpbit = {
      'USDT': orderedPrices['USDT'],
      'USDC': orderedPrices['USDC']
    };
    
    const normalCoins = {...orderedPrices};
    delete normalCoins.USDT;
    delete normalCoins.USDC;
    
    return { stablecoinFromUpbit, normalCoins };
  };

  const fetchGoldPrice = async () => {
    const response = await axios.get('http://localhost:3001/api/gold-price');
    return response.data.price;
  };


  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">🪙 코인 계산기</h1>
          <nav className="flex space-x-2 bg-gray-100 rounded-lg p-1">
            <NavLink to="/krw-to-coin" className={({ isActive }) => `px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${isActive ? 'bg-white text-[#00A495] shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}>
              KRW → 코인
            </NavLink>
            <NavLink to="/coin-to-krw" className={({ isActive }) => `px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${isActive ? 'bg-white text-[#00A495] shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}>
              코인 → KRW
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="flex-1 px-4 py-8 flex items-center justify-center">
        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#14B8A6] mx-auto mb-4"></div>
            <p className="text-gray-600">최신 정보를 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="text-center max-w-md">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
              <p className="text-orange-600 font-medium mb-2">⚠️ {error}</p>
              <button onClick={fetchAllData} className="bg-orange-100 hover:bg-orange-200 text-orange-700 px-4 py-2 rounded-lg text-sm transition-colors">
                새로고침
              </button>
            </div>
          </div>
        ) : (
          <Routes>
            <Route path="/krw-to-coin" element={<KrwToCoin stablecoinData={stablecoinData} upbitData={upbitData} />} />
            <Route path="/coin-to-krw" element={<CoinToKrw stablecoinData={stablecoinData} upbitData={upbitData} />} />
            <Route path="*" element={<KrwToCoin stablecoinData={stablecoinData} upbitData={upbitData} />} />
          </Routes>
        )}
      </main>

      <footer className="bg-gray-50 px-4 py-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-xs text-gray-500 space-y-1">
            <p>🔄 코인 시세: 업비트, CoinGecko | 금 시세: 금융위원회 API</p>
            {lastUpdated && (
              <p>
                ⏰ 마지막 업데이트: {lastUpdated.toLocaleString('ko-KR')}
              </p>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;