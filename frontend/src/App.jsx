import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
   
    console.log('App initialized. API endpoint: /api/locations')
  }, [])

  return (
    <div className="app-container">
      <header className="header">
        <h1>LocalFood</h1>
        <p>Tìm quán ăn local yêu thích</p>
      </header>

      <main className="main-content">
        <aside className="sidebar">
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Tìm kiếm món ăn..." 
            />
            <button>Tìm</button>
          </div>

          <div className="filter-panel">
            <h3>Lọc</h3>
            <label>
              <input type="checkbox" /> Quán cơm
            </label>
            <label>
              <input type="checkbox" /> Quán phở
            </label>
            <label>
              <input type="checkbox" /> Quán ăn vặt
            </label>
          </div>

          <button className="add-location-btn">+ Thêm địa điểm</button>
        </aside>

        <section className="map-section">
          <div id="map" className="map-container">
            <p>Bản đồ sẽ được tích hợp ở Ngày 5</p>
          </div>
        </section>

        <aside className="details-panel">
          <h3>Danh sách quán</h3>
          <div className="locations-list">
            {locations.length === 0 ? (
              <p>Chưa có dữ liệu. Đợi API backend...</p>
            ) : (
              locations.map(loc => (
                <div key={loc.id} className="location-card">
                  <h4>{loc.name}</h4>
                  <p>{loc.address}</p>
                </div>
              ))
            )}
          </div>
        </aside>
      </main>
    </div>
  )
}

export default App
