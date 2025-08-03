import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  // 탭 상태
  const [activeTab, setActiveTab] = useState('krw-to-coin');
  
  // KRW to Coin 상태
  const [krwAmount, setKrwAmount] = useState(100000); // 초기 KRW 금액 10만원
  
  // Coin to KRW 상태
  const [selectedCoin, setSelectedCoin] = useState('USDT');
  const [coinAmount, setCoinAmount] = useState(1); // 초기 코인 개수 1개

  // API 관련 상태
  const [krwUsdRate, setKrwUsdRate] = useState(null);
  const [stablecoinData, setStablecoinData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // 10분마다 환율을 가져오는 로직
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await axios.get(
          '/api-naver/p/csearch/content/qapirender.nhn?key=calculator&pkid=141&q=환율&where=m&u1=keb&u6=standardUnit&u7=0&u3=USD&u4=KRW&u8=down&u2=1'
        );
        if (response.data && response.data.country && response.data.country.length > 1) {
          const krwData = response.data.country[1];
          const rate = parseFloat(krwData.value.replace(/,/g, ''));
          setKrwUsdRate(rate);
          setLastUpdated(new Date());
        } else {
          throw new Error('API에서 환율 데이터를 가져오지 못했습니다.');
        }
      } catch (err) {
        setError(err.message || '환율 정보를 가져오는 중 오류가 발생했습니다.');
        console.error(err);
      }
    };
    fetchExchangeRate();
    const intervalId = setInterval(fetchExchangeRate, 10 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  // 스테이블코인 시세 가져오기
  useEffect(() => {
    const fetchStablecoinPrices = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api-stablecoin/api/summary');
        const prices = {};
        for (const symbol in response.data) {
          prices[symbol] = { price: response.data[symbol].price, type: 'stablecoin' };
        }
        setStablecoinData(prices);
      } catch (err) {
        setError(err.message || '스테이블코인 시세를 가져오는 중 오류가 발생했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStablecoinPrices();
    const intervalId = setInterval(fetchStablecoinPrices, 10 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* 헤더 */}
      <header className="bg-[#00A495] text-white px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">💱 환전 계산기</h1>
            <div className="flex bg-white/10 rounded-lg p-1">
              <button
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  activeTab === 'krw-to-coin'
                    ? 'bg-white text-[#00A495] shadow-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => setActiveTab('krw-to-coin')}
              >
                KRW → Coin
              </button>
              <button
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  activeTab === 'coin-to-krw'
                    ? 'bg-white text-[#00A495] shadow-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => setActiveTab('coin-to-krw')}
              >
                Coin → KRW
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* 상태 표시 */}
          {loading && (
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 text-center">
              <p className="text-gray-600 animate-pulse">최신 정보를 불러오는 중...</p>
            </div>
          )}
          {error && (
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 text-center">
              <p className="text-red-600 font-medium">오류: {error}</p>
            </div>
          )}

          {/* KRW to Coin 탭 */}
          {activeTab === 'krw-to-coin' && (
            <div className="space-y-6">
              {/* 입력 카드 */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <label className="block text-gray-800 font-semibold mb-2">
                  💰 원화 (KRW) 금액
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-3 focus-within:ring-2 focus-within:ring-[#14B8A6] focus-within:border-[#14B8A6]">
                  <span className="text-lg font-medium text-gray-600 mr-2">₩</span>
                  <input
                    type="number"
                    value={krwAmount}
                    onChange={(e) => setKrwAmount(e.target.value)}
                    className="flex-grow bg-transparent outline-none text-lg font-medium text-gray-800"
                    placeholder="금액을 입력하세요"
                  />
                  <span className="text-gray-600 ml-2">원</span>
                </div>
                <button className="w-full mt-4 bg-[#00A495] text-white py-3 rounded-lg font-medium hover:bg-[#00857A] transition-colors">
                  변환하기
                </button>
              </div>

              {/* 변환 결과 */}
              {!loading && !error && Object.keys(stablecoinData).length > 0 && (
                <div className="grid grid-cols-1 gap-4 min-w-[180px]">
                  {Object.keys(stablecoinData).sort().map((coinSymbol) => {
                    const coin = stablecoinData[coinSymbol];
                    if (!krwUsdRate || !coin.price) return null;

                    const equivalentUsd = krwAmount / krwUsdRate;
                    const equivalentCoin = equivalentUsd / coin.price;

                    return (
                      <div key={coinSymbol} className="bg-white rounded-lg shadow-sm p-4 flex items-center">
                        <div className="w-8 h-8 bg-[#14B8A6] rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-sm font-bold">
                            {coinSymbol.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">{coinSymbol}</div>
                          <div className="text-gray-700">
                            {equivalentCoin.toLocaleString(undefined, { maximumFractionDigits: 6 })} 개
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Coin to KRW 탭 */}
          {activeTab === 'coin-to-krw' && (
            <div className="space-y-6">
              {/* 입력 카드 */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <label className="block text-gray-800 font-semibold mb-2">
                  🪙 코인 선택 & 개수 입력
                </label>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <select
                    value={selectedCoin}
                    onChange={(e) => setSelectedCoin(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-3 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#14B8A6] focus:border-[#14B8A6]"
                  >
                    {Object.keys(stablecoinData).sort().map((coinSymbol) => (
                      <option key={coinSymbol} value={coinSymbol}>
                        {coinSymbol}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center border border-gray-300 rounded-lg px-3 py-3 focus-within:ring-2 focus-within:ring-[#14B8A6] focus-within:border-[#14B8A6]">
                    <input
                      type="number"
                      value={coinAmount}
                      onChange={(e) => setCoinAmount(e.target.value)}
                      className="flex-grow bg-transparent outline-none text-lg font-medium text-gray-800"
                      placeholder="수량"
                      step="0.000001"
                    />
                    <span className="text-gray-600 ml-2">개</span>
                  </div>
                </div>
                <button className="w-full bg-[#00A495] text-white py-3 rounded-lg font-medium hover:bg-[#00857A] transition-colors">
                  변환하기
                </button>
              </div>

              {/* 변환 결과 */}
              {!loading && !error && stablecoinData[selectedCoin] && krwUsdRate && (
                <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                  <p className="text-xl font-semibold text-gray-800">
                    {coinAmount} {selectedCoin} = {(coinAmount * stablecoinData[selectedCoin].price * krwUsdRate).toLocaleString('ko-KR')} KRW
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-slate-50 px-4 py-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-gray-700">
            환율 기준: 네이버, 코인 시세: StablecoinStats
            {lastUpdated && krwUsdRate && (
              <span className="block mt-1 text-gray-500">
                1 USD = {krwUsdRate.toLocaleString('ko-KR')} KRW (업데이트: {lastUpdated.toLocaleTimeString('ko-KR')})
              </span>
            )}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
