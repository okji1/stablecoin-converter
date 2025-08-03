
import React, { useState, useEffect } from 'react';

const Calculator = ({ stablecoinData, upbitData, goldPrice }) => {
  // 'krw-to-coin' 또는 'coin-to-krw'
  const [conversionDirection, setConversionDirection] = useState('krw-to-coin');

  const [krwAmount, setKrwAmount] = useState('100,000');
  const [coinAmount, setCoinAmount] = useState('1');

  const [selectedCoin, setSelectedCoin] = useState('USDT');
  const [coinType, setCoinType] = useState('stable'); // 'stable' | 'normal'

  // 현재 선택된 코인의 원화 가격
  const selectedCoinPrice =
    (coinType === 'stable'
      ? stablecoinData[selectedCoin]?.price
      : upbitData[selectedCoin]?.price) || 0;

  // KRW -> Coin 계산
  useEffect(() => {
    if (conversionDirection === 'krw-to-coin') {
      const numericKrw = parseFloat(krwAmount.replace(/,/g, '')) || 0;
      if (selectedCoinPrice > 0) {
        const result = numericKrw / selectedCoinPrice;
        setCoinAmount(result.toLocaleString(undefined, { maximumFractionDigits: 6 }));
      } else {
        setCoinAmount('0');
      }
    }
  }, [krwAmount, selectedCoin, selectedCoinPrice, conversionDirection]);

  // Coin -> KRW 계산
  useEffect(() => {
    if (conversionDirection === 'coin-to-krw') {
      const numericCoin = parseFloat(coinAmount.replace(/,/g, '')) || 0;
      const result = numericCoin * selectedCoinPrice;
      setKrwAmount(result.toLocaleString('ko-KR', { maximumFractionDigits: 3 }));
    }
  }, [coinAmount, selectedCoin, selectedCoinPrice, conversionDirection]);


  const handleKrwChange = (e) => {
    setConversionDirection('krw-to-coin');
    const value = e.target.value.replace(/,/g, '');
    if (!isNaN(value)) {
        setKrwAmount(Number(value).toLocaleString('ko-KR'));
    }
  };

  const handleCoinAmountChange = (e) => {
    setConversionDirection('coin-to-krw');
    setCoinAmount(e.target.value);
  };

  const handleCoinTypeChange = (type) => {
    setCoinType(type);
    // 코인 타입 변경 시 기본 코인 선택
    if (type === 'stable') {
      setSelectedCoin('USDT');
    } else {
      setSelectedCoin('BTC');
    }
    setConversionDirection('krw-to-coin'); // 방향 초기화
  };
  
  const toggleConversion = () => {
    setConversionDirection(prev => prev === 'krw-to-coin' ? 'coin-to-krw' : 'krw-to-coin');
  }

  const coinOptions =
    coinType === 'stable'
      ? ['USDT', 'USDC', 'TUSD', 'DAI', 'GUSD']
          .filter((symbol) => stablecoinData[symbol])
          .map((coinSymbol) => ({
            symbol: coinSymbol,
            label: coinSymbol,
          }))
      : Object.keys(upbitData)
          .map((coinSymbol) => ({
            symbol: coinSymbol,
            label: coinSymbol,
          }));

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6 space-y-4">
        {/* 코인/자산 타입 선택 */}
        <div className="flex justify-center bg-gray-100 rounded-lg p-1">
            <button onClick={() => handleCoinTypeChange('stable')} className={`w-full py-2 text-sm font-bold rounded-md transition-all ${coinType === 'stable' ? 'bg-white text-[#00A495] shadow-sm' : 'text-gray-500'}`}>스테이블코인</button>
            <button onClick={() => handleCoinTypeChange('normal')} className={`w-full py-2 text-sm font-bold rounded-md transition-all ${coinType === 'normal' ? 'bg-white text-[#6366F1] shadow-sm' : 'text-gray-500'}`}>일반 코인</button>
        </div>

        {/* 원화 입력 */}
        <div className="relative">
            <label className="block text-xs font-medium text-gray-500 mb-1">KRW</label>
            <div className="flex items-center">
                <span className="text-lg font-medium text-gray-400 mr-2">₩</span>
                <input
                    type="text"
                    value={krwAmount}
                    onChange={handleKrwChange}
                    className="w-full bg-transparent text-2xl font-bold text-gray-800 outline-none"
                />
            </div>
        </div>

        {/* 변환 버튼 */}
        <div className="flex justify-center items-center">
            <div className="w-full h-px bg-gray-200"></div>
            <button onClick={toggleConversion} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 12l-3-3m3 3l3-3m4 6V4m0 12l3-3m-3 3l-3-3" />
                </svg>
            </button>
            <div className="w-full h-px bg-gray-200"></div>
        </div>

        {/* 코인 입력 */}
        <div className="relative">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">코인 선택</label>
                    <select
                        value={selectedCoin}
                        onChange={(e) => {
                            setSelectedCoin(e.target.value);
                            setConversionDirection('krw-to-coin'); // 코인 변경 시 방향 초기화
                        }}
                        className="w-full bg-gray-100 border-none rounded-lg px-3 py-2 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                    >
                        {coinOptions.map((opt) => (
                            <option key={opt.symbol} value={opt.symbol}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">수량</label>
                    <input
                        type="text"
                        value={coinAmount}
                        onChange={handleCoinAmountChange}
                        className="w-full bg-gray-100 border-none rounded-lg px-3 py-2 text-lg font-bold text-gray-800 outline-none focus:ring-2 focus:ring-[#14B8A6]"
                    />
                </div>
            </div>
        </div>
        
        {/* 현재 시세 정보 */}
        <div className="text-center text-xs text-gray-500 pt-2">
            1 {selectedCoin} ≈ {selectedCoinPrice.toLocaleString('ko-KR')} KRW
        </div>
    </div>
  );
};

export default Calculator;
