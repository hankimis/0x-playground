export const EXAMPLES: Record<string, string> = {
  counter: `page Counter:
  state count: int = 0
  derived doubled = count * 2
  derived isPositive = count > 0

  fn increment():
    count += 1

  fn decrement():
    count -= 1

  fn reset():
    count = 0

  layout col gap=16 padding=24 center:
    text "카운터" size=2xl bold
    text "{count}" size=3xl bold color=#333
    text "두 배: {doubled}" size=lg color=#666

    layout row gap=8:
      button "-1" style=danger -> decrement()
      button "리셋" -> reset()
      button "+1" style=primary -> increment()`,

  todo: `page Todo:
  type Item = {id: int, text: str, done: bool}

  state items: list[Item] = []
  state input: str = ""
  derived remaining = items.filter(i => !i.done).length

  check items.length <= 500 "할일은 500개 이하"

  fn add():
    if input.trim() != "":
      items.push({id: Date.now(), text: input, done: false})
      input = ""

  fn remove(id: int):
    items = items.filter(i => i.id != id)

  layout col gap=16 padding=24 maxWidth=600 margin=auto:
    text "할 일 ({remaining}개 남음)" size=2xl bold

    layout row gap=8:
      input input placeholder="할 일을 입력하세요"
      button "추가" style=primary -> add()

    for item in items:
      layout row gap=8 center:
        toggle item.done
        text item.text strike={item.done} color={item.done ? "#999" : "#333"}
        button "삭제" style=danger size=sm -> remove(item.id)

    if items.length == 0:
      text "할 일이 없습니다" color=#999 center`,

  chat: `page Chat:
  type Message = {id: int, text: str, sender: str, time: datetime}

  state messages: list[Message] = []
  state input: str = ""
  state username: str = "나"

  fn send():
    if input.trim() != "":
      messages.push({
        id: Date.now(),
        text: input,
        sender: username,
        time: now()
      })
      input = ""

  fn onKeyPress(key):
    if key == "Enter": send()

  layout col height=100vh:
    layout row center padding=16 bg=#075e54:
      text "채팅방" size=lg bold color=white

    layout col gap=8 padding=16 scroll=y grow=1:
      for msg in messages:
        layout row:
          layout col padding=12 radius=12 maxWidth="70%" bg={msg.sender == username ? "#dcf8c6" : "white"} shadow=sm:
            text msg.text
            text msg.time.format("HH:mm") size=xs color=#999 end

    layout row gap=8 padding=16 bg=#f0f0f0:
      input input placeholder="메시지 입력..."
      button "전송" style=primary -> send()`,

  dashboard: `page Dashboard:
  type Metric = {label: str, value: float, change: float}

  state metrics: list[Metric] = []
  state period: str = "week"
  state loading: bool = true

  api getMetrics = GET "/api/metrics"

  on mount:
    metrics = await getMetrics(period: period)
    loading = false

  watch period:
    loading = true
    metrics = await getMetrics(period: period)
    loading = false

  layout col gap=24 padding=32:
    layout row between center:
      text "대시보드" size=3xl bold
      select period options=["day", "week", "month", "year"]

    if loading:
      text "로딩 중..." center
    else:
      layout grid cols=3 gap=16:
        for metric in metrics:
          component MetricCard(metric)

component MetricCard:
  prop metric: Metric

  derived isPositive = metric.change >= 0
  derived arrow = isPositive ? "↑" : "↓"
  derived changeColor = isPositive ? "green" : "red"

  style card:
    padding: 24
    radius: 12
    shadow: md
    bg: white

  layout col gap=8 .card:
    text metric.label size=sm color=#666
    text "{metric.value}" size=2xl bold
    text "{arrow} {metric.change}%" size=sm color={changeColor}`,

  ecommerce: `page Shop:
  type Product = {id: int, name: str, price: float, image: str}
  type CartItem = {product: Product, qty: int}

  state products: list[Product] = []
  state cart: list[CartItem] = []
  state search: str = ""
  state loading: bool = true

  derived filteredProducts = products.filter(p => p.name.includes(search))
  derived cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0)
  derived cartCount = cart.reduce((sum, item) => sum + item.qty, 0)

  check cart.length <= 100 "장바구니는 100개 이하"
  check cartTotal >= 0 "총액은 음수 불가"

  api getProducts = GET "/api/products"

  on mount:
    products = await getProducts()
    loading = false

  fn addToCart(product: Product):
    existing = cart.find(item => item.product.id == product.id)
    if existing:
      existing.qty += 1
    else:
      cart.push({product: product, qty: 1})

  fn removeFromCart(productId: int):
    cart = cart.filter(item => item.product.id != productId)

  layout col gap=24 padding=32:
    layout row between center:
      text "쇼핑몰" size=3xl bold
      layout row gap=8 center:
        text "장바구니 ({cartCount})" size=lg
        text "₩{cartTotal}" size=lg bold color=#e74c3c

    input search placeholder="상품 검색..."

    if loading:
      text "로딩 중..." center
    else:
      layout grid cols=3 gap=16:
        for product in filteredProducts:
          layout col gap=8 padding=16 radius=12 shadow=md bg=white:
            image product.image width="100%" height=200
            text product.name size=lg bold
            text "₩{product.price}" size=md color=#e74c3c
            button "장바구니 담기" style=primary -> addToCart(product)`,

  // Phase 1 Advanced Examples
  model_crud: `model Product:
  name: str
  price: float
  category: str
  createdAt: datetime = now()

  validate:
    name.length >= 2 "이름은 2자 이상"
    price > 0 "가격은 양수"

  permission:
    read: all
    write: auth
    delete: admin

  search: name, category
  sort: price, createdAt
  filter: category

page ProductList:
  data products = fetch("/api/products"):
    loading: "로딩 중..."
    error: "상품을 불러올 수 없습니다"
    empty: "등록된 상품이 없습니다"

  layout col gap=16 padding=24:
    text "상품 관리" size=2xl bold

    table products:
      columns:
        select
        column "상품명" name sortable searchable
        column "가격" price sortable
        column "카테고리" category filterable
        actions: [edit, delete]
      features:
        pagination: 20`,

  // Phase 2 Advanced Examples
  auth_dashboard: `auth provider="supabase":
  login: email, password
  signup: email, password, name
  logout
  guard: auth -> redirect("/login")
  guard: admin -> redirect("/")

route "/dashboard":
  page Dashboard
  guard: auth

page Dashboard:
  state revenue: int = 0
  state sales: list = []

  nav:
    link "대시보드" href="/"
    link "상품" href="/products"
    link "설정" href="/settings"

  chart bar salesChart:
    data: sales
    x: month
    y: revenue
    title: "월별 매출"

  layout row:
    stat "총 매출" value=revenue change="+12%"
    stat "주문 수" value=42`,

  realtime_chat: `page ChatRoom:
  state messages: list = []
  state input: str = ""

  realtime ws = subscribe("wss://chat.example.com"):
    on message:
      messages.push(message)
    on error:
      console.log("연결 끊김")

  layout col:
    text "실시간 채팅" size=2xl bold

    layout col gap=8 scroll=y:
      for msg in messages:
        text msg.text

    layout row gap=8:
      input input placeholder="메시지 입력..."
      button "전송" style=primary -> ws.send(input)`,

  upload_modal: `page Profile:
  upload avatar:
    accept: "image/*"
    maxSize: 5
    preview: true

  modal editDialog title="프로필 편집" trigger="편집":
    text "프로필 정보를 수정하세요"
    button "저장" style=primary -> save()

  layout col gap=16 padding=24:
    text "프로필" size=2xl bold
    toast "저장 완료!" type=success duration=3000`,

  // Phase 3 Advanced Examples
  landing_page: `page Landing:
  seo:
    title: "0x - AI 퍼스트 언어"
    description: "AI로 더 빠르게 웹앱 개발"

  nav:
    link "홈" href="/"
    link "기능" href="#features"
    link "가격" href="#pricing"

  hero:
    text "0x" size=3xl bold
    text "AI로 더 빠르게 개발하세요" size=xl
    button "시작하기" style=primary -> navigate("/start")

  layout col:
    text "Welcome" size=2xl`,

  admin_crud: `roles:
  admin:
    can: read, write, delete
  editor:
    can: read, write

page Admin:
  crud Product:
    text "상품 관리"

  layout col gap=16 padding=24:
    stats 3:
      stat "매출" value=revenue
      stat "주문" value=orders
    breadcrumb auto
    text "관리자 패널" size=2xl bold`,

  interactive: `page Interactive:
  state post: str = ""
  state images: list = []

  layout col gap=16 padding=24:
    animate enter:
      text "애니메이션 효과" size=2xl bold

    mobile show:
      text "모바일 전용 컨텐츠"

    drawer sidebar:
      text "사이드바 메뉴"

    search global products:
      text "검색 결과"

    social like post:
      text "좋아요"

    pay checkout:
      text "결제"

    media gallery images cols=3

    confirm "정말 삭제하시겠습니까?" danger confirm="삭제" cancel="취소"`,

  form_validation: `page Contact:
  form contactForm:
    field name: str
      label: "이름"
      required: "이름을 입력하세요"
      min: 2 "2자 이상 입력"

    field email: str
      label: "이메일"
      format: email "올바른 이메일 형식이 아닙니다"

    field phone: str
      label: "전화번호"
      pattern: "^01[0-9]{8,9}$" "올바른 전화번호 형식"

    field message: str
      label: "메시지"
      max: 500 "500자 이하"

    submit "보내기" -> api.sendContact(contactForm.data):
      success: toast("전송 완료!")
      error: toast("전송 실패")

  layout col gap=16 padding=24 center:
    text "문의하기" size=2xl bold
    text "아래 양식을 작성해주세요" color=#666`,
};

export const EXAMPLE_NAMES: Record<string, string> = {
  counter: '카운터',
  todo: '할 일 목록',
  chat: '채팅',
  dashboard: '대시보드',
  ecommerce: '쇼핑몰',
  model_crud: 'Model+CRUD',
  form_validation: 'Form 검증',
  auth_dashboard: '인증+대시보드',
  realtime_chat: '실시간 채팅',
  upload_modal: '업로드+모달',
  landing_page: '랜딩 페이지',
  admin_crud: '관리자+CRUD',
  interactive: '인터랙티브',
};
