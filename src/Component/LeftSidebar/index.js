import React from "react";
import { FaCaretRight, FaCaretLeft } from "react-icons/fa";
import droneImage from '../../assets/images/drone.png';

const LeftSidebar = ({
  drones,
  selectedDrone,
  handleDroneClick,
  isSidebarOpen,
  toggleSidebar,
  clearSelectedDrone,
}) => {
  const renderDroneDetail = () => {
    if (!selectedDrone) return null;

    const currentDroneData =
      drones.find((d) => d.id === selectedDrone.id) || selectedDrone;

    return (
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <h3 style={{ margin: 0, color: "#00BFFF" }}>
            Chi tiết Drone {currentDroneData.id}
          </h3>
          <button
            onClick={clearSelectedDrone}
            style={{
              background: "none",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
              color: "#666",
              padding: "0 5px",
            }}
            title="Quay lại danh sách"
          >
            &times;
          </button>
        </div>

        <div
          style={{
            border: "1px solid #ddd",
            padding: "15px",
            borderRadius: "5px",
          }}
        >
          <p>
            <strong>ID Đơn hàng:</strong> {currentDroneData.orderId}
          </p>
          <p>
            <strong>Trạng thái:</strong>
            <span
              style={{
                color:
                  currentDroneData.orderStatus === "Đang vận chuyển"
                    ? "#FF0000"
                    : "#009900",
                fontWeight: "bold",
              }}
            >
              {currentDroneData.orderStatus}
            </span>
          </p>
          <p>
            <strong>Xuất phát:</strong> {currentDroneData.startLocation}
          </p>
          <p>
            <strong>Điểm đến:</strong> {currentDroneData.endLocation}
          </p>
          <p>
            <strong>Tọa độ hiện tại:</strong>
            {currentDroneData.currentPosition[0].toFixed(4)},{" "}
            {currentDroneData.currentPosition[1].toFixed(4)}
          </p>
        </div>
      </div>
    );
  };

  const renderDroneList = () => (
    <>
      <h3 style={{ margin: "0 0 15px 0", color: "#333" }}>
        📋 Danh sách Drones ({drones.length})
      </h3>
      {drones.map((drone) => (
        <div
          key={drone.id}
          onClick={() => handleDroneClick(drone)}
          style={{
            padding: "8px",
            marginBottom: "5px",
            borderLeft: `5px solid ${
              selectedDrone?.id === drone.id ? "#00BFFF" : "transparent"
            }`,
            backgroundColor:
              selectedDrone?.id === drone.id ? "#e0f7ff" : "transparent",
            cursor: "pointer",
            borderRadius: "3px",
            transition: "background-color 0.2s",
          }}
        >
          <strong>{drone.id}</strong>
          <small
            style={{
              float: "right",
              color: drone.orderStatus === "Đã giao" ? "#009900" : "#FF0000",
            }}
          >
            {drone.orderStatus}
          </small>
          <p style={{ margin: 0, fontSize: "0.85em", color: "#666" }}>
            Đích: {drone.endLocation}
          </p>
        </div>
      ))}
    </>
  );

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 10,
          left: isSidebarOpen ? 310 : 10,
          zIndex: 10,
          transition: "left 0.3s ease-out",
        }}
      >
        <button
          onClick={toggleSidebar}
          style={{
            padding: "0px",
            backgroundColor: "#ccc",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {isSidebarOpen ? (
            <FaCaretLeft style={{ fontSize: 24 }} />
          ) : (
            <FaCaretRight style={{ fontSize: 24 }} />
          )}
        </button>
      </div>

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: "280px",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          boxShadow: "2px 0 5px rgba(0, 0, 0, 0.2)",
          zIndex: 9,
          transform: isSidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease-out",
          padding: "15px",
          overflowY: "auto",
        }}
      >
        {selectedDrone ? renderDroneDetail() : renderDroneList()}
      </div>
    </>
  );
};

export default LeftSidebar;
