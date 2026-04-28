from bs4 import BeautifulSoup

# BeautifulSoupを実際に使ってみる
soup = BeautifulSoup("<html></html>", "html.parser")

print("インストール成功！")
print(f"解析器の状態: {soup.name}")