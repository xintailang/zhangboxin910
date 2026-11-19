# zhangboxin 接口记录

格式：接口路径 | HTTP 方法 | 请求参数（含示例） | 响应格式（含 JSON 示例） | 修改时间

## 服务健康检查

- 接口路径：`/api/health`
- HTTP 方法：`GET`
- 请求参数：无

  ```http
  GET http://localhost:8910/api/health
  ```

- 响应格式：

  ```json
  {
    "code": 0,
    "msg": "服务运行正常",
    "data": {
      "zbxProjectName": "校园二手交易平台",
      "zbxStudentName": "zhangboxin",
      "zbxStudentId": "24001010910",
      "zbxPort": 8910,
      "zbxTime": "2026/11/19 13:53:33"
    }
  }
  ```

- 修改时间：2026-11-19 13:53
