/**
 * 簡單的 Google Places API 測試端點
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    
    console.log('🧪 測試 Google Places API');
    console.log('🔑 API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : '未設定');
    
    if (!apiKey) {
      return NextResponse.json({
        error: 'API Key 未設定'
      }, { status: 500 });
    }

    // 測試多個 API
    const tests = [
      {
        name: 'Geocoding API',
        url: `https://maps.googleapis.com/maps/api/geocode/json?key=${apiKey}&address=Tokyo Station`
      },
      {
        name: 'Places Text Search API (Legacy)',
        url: `https://maps.googleapis.com/maps/api/place/textsearch/json?key=${apiKey}&query=Tokyo Station`
      }
    ];

    // 新版 Places API 測試
    const newPlacesTest = async () => {
      try {
        const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': 'places.displayName,places.location,places.rating'
          },
          body: JSON.stringify({
            textQuery: 'スターバックス 東京',
            maxResultCount: 20
          })
        });

        const result = await response.json();
        return {
          name: 'Places API (New)',
          success: response.ok,
          status: response.status,
          error_message: result.error?.message,
          results_count: result.places?.length || 0,
          response: result
        };
      } catch (error) {
        return {
          name: 'Places API (New)',
          success: false,
          error: error instanceof Error ? error.message : '未知錯誤'
        };
      }
    };

    const results = [];

    for (const test of tests) {
      try {
        console.log(`🧪 測試 ${test.name}:`, test.url);
        const response = await fetch(test.url);
        const result = await response.json();
        
        results.push({
          name: test.name,
          success: response.ok,
          status: result.status,
          error_message: result.error_message,
          results_count: result.results?.length || 0
        });
      } catch (error) {
        results.push({
          name: test.name,
          success: false,
          error: error instanceof Error ? error.message : '未知錯誤'
        });
      }
    }

    // 測試新版 Places API
    const newPlacesResult = await newPlacesTest();
    results.push(newPlacesResult);

    return NextResponse.json({
      api_key_prefix: apiKey.substring(0, 10),
      test_results: results
    });

  } catch (error) {
    console.error('❌ 測試錯誤:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 });
  }
}