from urllib2 import Request, urlopen

values = """
  {
    "deal_request_params": {
      "computation_type": "selected_products",
      "vendor_carts": [
        {
          "products": [
            {
              "catalog_product_info_id": 3202883,
              "add_to_cart_params": {
                "upcId[\"2259112\"]": 1
              },
              "delete_from_cart_params": null,
              "is_selected": true,
              "large_image_url": "http://images.bloomingdales.com/is/image/BLM/products/9/optimized/8701989_fpx.tif?bgc=255,255,255&wid=768&qlt=90,0&layer=comp&op_sharpen=0&resMode=bicub&op_usm=0.7,1.0,0.5,0&fmt=jpeg",
              "vendor_image_url": "http://images.bloomingdales.com/is/image/BLM/products/9/optimized/8701989_fpx.tif?bgc=255,255,255&wid=768&qlt=90,0&layer=comp&op_sharpen=0&resMode=bicub&op_usm=0.7,1.0,0.5,0&fmt=jpeg",
              "extra_images": "^MEDIUMhttp://images.bloomingdales.com/is/image/BLM/products/9/optimized/8701989_fpx.tif?bgc=255,255,255&wid=768&qlt=90,0&layer=comp&op_sharpen=0&resMode=bicub&op_usm=0.7,1.0,0.5,0&fmt=jpeg^",
              "long_description": "Bb Dakota Plus Hillary Dress",
              "short_description": "Bb Dakota Plus Hillary Dress",
              "mfg_name": "Bb Dakota Plus",
              "name": "Bb Dakota Plus Hillary Dress",
              "product_details": {
                "color": "Overcast Bue",
                "size": "18"
              },
              "qty": 1,
              "upc_id": "2259112",
              "vendor_catalog_url": "http://click.linksynergy.com/deeplink?id=ihgvdIVmdMw&mid=13867&murl=http%3A%2F%2Fwww1.bloomingdales.com%2Fshop%2Fproduct%2Fbb-dakota-plus-hillary-dress%3FID%3D1219957&u1=MavatarUser",
              "vendor_info": {
                "code": "Bloomingdales",
                "name": "Bloomingdale's"
              },
              "vendor_price": 103.6,
              "vendor_unique_product_id": "2259112"
            }
          ],
          "vendor_code": "Bloomingdales",
          "zip_code": null
        }
      ]
    },
    "mav_user_api_key": "b4ClBrgJL7NDppi7QPtL"
  }
"""

headers = {
  'Content-Type': 'application/json'
}
request = Request('https://api-dev.mavatar.com/deal_request.json', data=values, headers=headers)

response_body = urlopen(request).read()
print response_body