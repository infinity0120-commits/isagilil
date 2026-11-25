'use client'

import { useState } from 'react'
import { ArrowLeftRight, ArrowRight, Check, ChevronDown, CircleHelp, Clock3, Home, MapPin, Plus, ShieldCheck, Sparkles, Trash2, Truck, Wind, Wrench } from 'lucide-react'

import { REGION_OPTIONS } from './region-options'
import DateRecommendations from './date-recommendations'
import OptionSimulator from './option-simulator'

type Member = { id: number; role: string; birth: string; calendar: string; gender: string }
type RegionSelection = { province: string; district: string; manual: boolean; custom: string }
type Result = { year: string; month: string; direction: string; origin: string; destination: string; members: Member[]; weekend: string; priority: string }

const provinces = Object.keys(REGION_OPTIONS)
const directionNames = ['북', '북동', '동', '남동', '남', '남서', '서', '북서']
const loadingMessages = ['가족 구성원 사주 기운 분석 중...', '대장군방·삼살방 방위 대조 중...', '손 없는 날 대비 절약 비용 계산 중...']

function getRegionLabel(selection: RegionSelection) {
  return selection.manual ? selection.custom.trim() || `${selection.province} 직접 입력` : `${selection.province} ${selection.district}`
}

function getMovingDirection(origin: RegionSelection, destination: RegionSelection) {
  if (origin.manual || destination.manual) return '좌표 확인 필요'

  const originPoint = REGION_OPTIONS[origin.province]?.find(([label]) => label === origin.district)
  const destinationPoint = REGION_OPTIONS[destination.province]?.find(([label]) => label === destination.district)
  if (!originPoint || !destinationPoint) return '좌표 확인 필요'
  if (originPoint[1] === destinationPoint[1] && originPoint[2] === destinationPoint[2]) return '동일 지역'

  const toRadians = (degrees: number) => degrees * Math.PI / 180
  const latitude1 = toRadians(originPoint[1])
  const latitude2 = toRadians(destinationPoint[1])
  const longitudeDelta = toRadians(destinationPoint[2] - originPoint[2])
  const bearing = (Math.atan2(
    Math.sin(longitudeDelta) * Math.cos(latitude2),
    Math.cos(latitude1) * Math.sin(latitude2) - Math.sin(latitude1) * Math.cos(latitude2) * Math.cos(longitudeDelta),
  ) * 180 / Math.PI + 360) % 360

  return directionNames[Math.round(bearing / 45) % 8]
}

function RegionSelector({ label, value, onChange }: { label: string; value: RegionSelection; onChange: (value: RegionSelection) => void }) {
  const districts = REGION_OPTIONS[value.province] ?? []
  const selectId = label === '출발지' ? 'origin' : 'destination'

  return <div className="route-location">
    <label className="field-label" htmlFor={`${selectId}-province`}>{label}</label>
    <div className="region-selects">
      <div className="region-select-icon"><select id={`${selectId}-province`} aria-label={`${label} 시/도`} value={value.province} onChange={(event) => {
        const province = event.target.value
        onChange({ province, district: REGION_OPTIONS[province]?.[0]?.[0] ?? '', manual: false, custom: '' })
      }}>
        {provinces.map((province) => <option key={province} value={province}>{province}</option>)}
      </select><ChevronDown size={14} aria-hidden="true" /></div>
      <div className="region-select-icon"><select aria-label={`${label} 시/군/구`} value={value.manual ? '__manual__' : value.district} onChange={(event) => {
        const district = event.target.value
        onChange(district === '__manual__' ? { ...value, district: '', manual: true } : { ...value, district, manual: false, custom: '' })
      }}>
        {districts.map(([district]) => <option key={district} value={district}>{district}</option>)}
        <option value="__manual__">직접 입력</option>
      </select><ChevronDown size={14} aria-hidden="true" /></div>
    </div>
    {value.manual && <input className="region-manual-input" aria-label={`${label} 직접 입력`} placeholder="시/군/구를 입력해 주세요" value={value.custom} onChange={(event) => onChange({ ...value, custom: event.target.value })} required />}
  </div>
}

function SectionHeading({ number, title, detail }: { number: string; title: string; detail?: string }) {
  return <div className="section-heading"><span className="step-number">{number}</span><div><h2>{title}</h2>{detail && <p>{detail}</p>}</div></div>
}

function Label({ children }: { children: React.ReactNode }) { return <label className="field-label">{children}</label> }

export default function MovingLab() {
  const [year, setYear] = useState('2026')
  const [month, setMonth] = useState('12')
  const [origin, setOrigin] = useState<RegionSelection>({ province: '서울', district: '송파구', manual: false, custom: '' })
  const [destination, setDestination] = useState<RegionSelection>({ province: '경기', district: '하남시', manual: false, custom: '' })
  const [members, setMembers] = useState<Member[]>([{ id: 1, role: '나', birth: '', calendar: '양력', gender: '여성' }])
  const [priority, setPriority] = useState('value')
  const [weekend, setWeekend] = useState('weekday')
  const [size, setSize] = useState('20평대')
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [result, setResult] = useState<Result | null>(null)
  const [activeTab, setActiveTab] = useState('date')
  const addMember = () => setMembers((current) => [...current, { id: Date.now(), role: '가족', birth: '', calendar: '양력', gender: '여성' }])
  const updateMember = (id: number, key: keyof Member, value: string) => setMembers((current) => current.map((member) => member.id === id ? { ...member, [key]: value } : member))
  const analyze = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setLoadingStep(0)
    setResult(null)
    const loadingInterval = window.setInterval(() => setLoadingStep((step) => Math.min(step + 1, loadingMessages.length - 1)), 1300)
    window.setTimeout(() => {
      window.clearInterval(loadingInterval)
      setResult({ year, month, direction: getMovingDirection(origin, destination), origin: getRegionLabel(origin), destination: getRegionLabel(destination), members: members.map((member) => ({ ...member })), weekend, priority })
      setLoading(false)
      window.setTimeout(() => document.getElementById('analysis-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
    }, 4000)
  }

  return <main className="moving-app">
    <header className="topbar"><a href="#top" className="brand" aria-label="이사길일연구소 홈"><span className="brand-mark"><Sparkles size={18} /></span><span>이사길일<span className="brand-light">연구소</span><small>MOVING LAB</small></span></a><a className="top-link" href="#how-it-works">분석 기준 <ArrowRight size={14} /></a></header>
    <section className="hero" id="top">
      <div className="hero-copy"><div className="eyebrow"><span className="live-dot" /> 가족 맞춤 이사 분석</div><h1>새로운 시작,<br /><span>좋은 날부터</span> 준비하세요.</h1><p>가족의 생년월일과 이사 조건을 바탕으로<br className="desktop-break" /> 알뜰한 길일과 현실적인 이사 비용을 찾아드려요.</p><div className="trust-row"><span><ShieldCheck size={15} /> 개인정보는 저장되지 않아요</span><span><Clock3 size={15} /> 약 1분이면 충분해요</span></div></div>
      <div className="hero-art" aria-hidden="true"><div className="sun-disc" /><div className="art-card"><div className="mini-calendar"><span>DECEMBER 2026</span><b>14</b><small>좋은 시작을 위한 하루</small></div><div className="art-sparkle sparkle-one">✳</div><div className="art-sparkle sparkle-two">✦</div></div><div className="art-caption"><span className="caption-dot" /> 매달 달라지는 추천 날짜</div></div>
    </section>
    <div className="trust-strip"><span><Check size={16} /> 복잡한 사주 대신 쉬운 기준</span><span><Check size={16} /> 비용 비교 한눈에</span><span><Check size={16} /> 강요 없는 맞춤 정보</span></div>

    <div className="content-grid"><form className="form-card" onSubmit={analyze}>
      <div className="form-intro"><span className="form-kicker">맞춤 분석 시작하기</span><h2>이사 정보를 알려주세요</h2><p>입력하신 정보는 분석에만 사용돼요.</p></div>
      <section className="form-section"><SectionHeading number="01" title="이사 예정 시기" detail="희망하는 달을 선택해 주세요."/><div className="field-grid two"><div><Label>이사 연도</Label><select value={year} onChange={(e) => setYear(e.target.value)}><option>2025</option><option>2026</option></select></div><div><Label>이사 월</Label><select value={month} onChange={(e) => setMonth(e.target.value)}>{Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={String(i + 1)}>{i + 1}월</option>)}</select></div></div></section>
      <section className="form-section"><SectionHeading number="02" title="이사 출발지와 도착지" detail="지역별 이동 조건을 함께 고려해요."/><div className="route-fields"><RegionSelector label="출발지" value={origin} onChange={setOrigin}/><button type="button" aria-label="출발지와 도착지 바꾸기" className="swap-button" onClick={() => { setOrigin(destination); setDestination(origin) }}><ArrowLeftRight size={17} /></button><RegionSelector label="도착지" value={destination} onChange={setDestination}/></div></section>
      <section className="form-section"><SectionHeading number="03" title="가족 구성원" detail="함께 이사하는 분의 생년월일을 입력해요."/>{members.map((member, index) => <div className="member-card" key={member.id}><div className="member-title"><span>{index === 0 ? '대표 가족' : `가족 구성원 ${index}`}</span>{index > 0 && <button className="icon-button" type="button" aria-label="가족 구성원 삭제" onClick={() => setMembers((current) => current.filter((item) => item.id !== member.id))}><Trash2 size={15} /></button>}</div><div className="member-controls"><div><label className="field-label" htmlFor={`member-name-${member.id}`}>이름 또는 관계</label><input id={`member-name-${member.id}`} placeholder={index === 0 ? '예: 나' : '예: 배우자'} value={member.role} onChange={(e) => updateMember(member.id, 'role', e.target.value)} required /></div><div><label className="field-label" htmlFor={`member-birth-${member.id}`}>생년월일</label><input id={`member-birth-${member.id}`} type="date" value={member.birth} onChange={(e) => updateMember(member.id, 'birth', e.target.value)} required /></div></div><div className="member-options"><div className="segmented small"><button type="button" className={member.calendar === '양력' ? 'selected' : ''} onClick={() => updateMember(member.id, 'calendar', '양력')}>양력</button><button type="button" className={member.calendar === '음력' ? 'selected' : ''} onClick={() => updateMember(member.id, 'calendar', '음력')}>음력</button></div><div className="segmented small"><button type="button" className={member.gender === '여성' ? 'selected' : ''} onClick={() => updateMember(member.id, 'gender', '여성')}>여성</button><button type="button" className={member.gender === '남성' ? 'selected' : ''} onClick={() => updateMember(member.id, 'gender', '남성')}>남성</button></div></div></div>)}<button type="button" className="add-member" onClick={addMember}><Plus size={16} /> 가족 구성원 추가</button></section>
      <section className="form-section"><SectionHeading number="04" title="이사 우선순위"/><Label>어떤 기준이 가장 중요하세요?</Label><div className="choice-row"><button type="button" className={`choice-card ${priority === 'value' ? 'active' : ''}`} onClick={() => setPriority('value')}><span className="choice-radio" /><span><b>가성비 최우선</b><small>비용 부담 적은 길일</small></span></button><button type="button" className={`choice-card ${priority === 'traditional' ? 'active' : ''}`} onClick={() => setPriority('traditional')}><span className="choice-radio" /><span><b>전통·안전 최우선</b><small>좋은 기운을 우선으로</small></span></button></div><div className="field-spacer"><Label>요일 선호</Label><div className="segmented wide"><button type="button" className={weekend === 'weekday' ? 'selected' : ''} onClick={() => setWeekend('weekday')}>평일도 무관 <small>비용 절약</small></button><button type="button" className={weekend === 'weekend' ? 'selected' : ''} onClick={() => setWeekend('weekend')}>주말·공휴일 <small>편한 일정</small></button></div></div><div className="field-spacer"><Label>현재 집 크기</Label><div className="size-options">{['15평 이하', '20평대', '30평대 이상'].map((option) => <button type="button" key={option} className={size === option ? 'selected' : ''} onClick={() => setSize(option)}><Home size={15} />{option}</button>)}</div></div></section>
      <button type="submit" className="submit-button" disabled={loading}>{loading ? <><span className="button-spinner" /> 분석 준비 중...</> : <><Sparkles size={18} /> 우리 가족 맞춤 길일 & 예상 견적 분석하기 <ArrowRight size={17} /></>}</button><p className="privacy-note"><ShieldCheck size={14} /> 입력 정보는 브라우저에서 분석되며 서버에 저장되지 않습니다.</p>
    </form>
    <aside className="aside-column"><div className="aside-note"><div className="note-icon"><Sparkles size={18} /></div><h3>이런 내용을<br />확인할 수 있어요</h3><ul><li><span>01</span> 가족 조건을 고려한 날짜 후보</li><li><span>02</span> 이사 방향과 날짜 참고 정보</li><li><span>03</span> 이사 규모별 예상 비용 비교</li></ul><div className="note-foot">※ 전통 명리 기준을 참고한 생활 정보입니다.</div></div><div className="quote-card"><span className="quote-mark">“</span><p>좋은 이사는<br />좋은 준비에서 시작돼요.</p><span className="quote-caption">MOVING LAB · YOUR NEXT CHAPTER</span></div><div className="aside-mini"><CircleHelp size={17} /><span>이사 날짜는 업체 일정과 실제 비용도 꼭 함께 확인해 주세요.</span></div></aside></div>

    {loading && <div className="loading-overlay" role="status" aria-live="polite"><div className="loading-card"><div className="loading-orbit"><Sparkles size={25} /></div><h2>우리 가족의 이삿날을<br />살펴보고 있어요</h2><p>잠시만 기다려 주세요.</p><div className="progress-track"><span /></div><div className="loading-steps" aria-live="polite"><span><Sparkles size={14} /> {loadingMessages[loadingStep]}</span></div><div className="sponsored-slot" aria-label="광고 영역"><span>SPONSORED / 광고</span></div><p className="loading-ad-caption">잠시만 기다려주세요, 최적의 길일 분석 결과를 불러오는 중입니다 (약 3초)</p></div></div>}

    {result && <section id="analysis-result" className="results-section"><div className="result-heading"><span className="eyebrow"><span className="live-dot" /> 가족 맞춤 분석 결과</span><h2>이사하기 좋은 날을<br /><span>찾아봤어요.</span></h2><p>{result.year}년 {result.month}월 · {result.origin} → {result.destination}</p><div className="direction-result" aria-live="polite"><span><MapPin size={14} aria-hidden="true"/> 이동 방향</span><b>{result.direction}</b><small>{result.direction === '좌표 확인 필요' ? '직접 입력한 지역은 좌표가 없어 방향을 계산할 수 없어요.' : '지역별 대표 좌표를 기준으로 계산한 대략적인 방향이에요.'}</small></div></div><div className="result-tabs" role="tablist" aria-label="분석 결과 보기"><button id="date-tab" type="button" className={activeTab === 'date' ? 'active' : ''} onClick={() => setActiveTab('date')} role="tab" aria-selected={activeTab === 'date'} aria-controls="date-panel">추천 날짜</button><button id="cost-tab" type="button" className={activeTab === 'cost' ? 'active' : ''} onClick={() => setActiveTab('cost')} role="tab" aria-selected={activeTab === 'cost'} aria-controls="cost-panel">예상 비용</button></div>
      <div id="date-panel" role="tabpanel" aria-labelledby="date-tab" hidden={activeTab !== 'date'}><DateRecommendations year={result.year} month={result.month} direction={result.direction} origin={result.origin} destination={result.destination} members={result.members} weekend={result.weekend} priority={result.priority} /></div>
      <div id="cost-panel" role="tabpanel" aria-labelledby="cost-tab" hidden={activeTab !== 'cost'}><OptionSimulator homeSize={size} /></div>
      <div className="service-heading"><span className="section-overline">GOOD PEOPLE, GOOD MOVE</span><h3>필요한 서비스, 한 번에 비교하세요</h3><p>조건에 맞는 업체를 직접 비교하고 선택할 수 있어요.</p></div><div className="service-grid">{[{ icon: <Truck size={20} />, category: 'MOVING SERVICE', title: '[추천 길일 맞춤] 포장이사 우수업체 3곳 무료 방문견적', cta: '무료 방문견적 신청하기' }, { icon: <Wind size={20} />, category: 'AIR CONDITIONER', title: '[배관·가스비 정찰제] 에어컨 전문기사 가격 비교', cta: '에어컨 설치 견적받기' }, { icon: <Wrench size={20} />, category: 'WALL-MOUNTED TV', title: '[대리석 타공·선숨김] 벽걸이 TV 전문 엔지니어', cta: 'TV 설치 견적받기' }, { icon: <Home size={20} />, category: 'MOVE-IN CLEANING', title: '[피톤치드 살균 포함] 입주·이사 청소 가격 비교', cta: '입주청소 견적 알아보기' }].map((service) => <article className="service-card" key={service.category}><div className="service-icon">{service.icon}</div><span>{service.category}</span><h4>{service.title}</h4><a href="#contact" onClick={(e) => { e.preventDefault(); alert('제휴 서비스 연결을 준비 중입니다. 업체 선택 전 추가 비용과 서비스 범위를 확인해 주세요.') }}>{service.cta}<ArrowRight size={15} /></a></article>)}</div><p className="disclaimer" id="how-it-works">이사길일연구소의 날짜 점수는 이해를 돕기 위한 참고용 시뮬레이션이며 과학적 예측이나 전문 역술 상담을 대체하지 않습니다. 이사 비용과 서비스 조건은 업체·현장에 따라 달라지므로 계약 전 상세 견적을 확인하세요.</p>
    </section>}
    <footer className="footer"><a href="#top" className="brand"><span className="brand-mark"><Sparkles size={16} /></span><span>이사길<span className="brand-light">연구소</span><small>MOVING LAB</small></span></a><span>더 편안한 이사의 시작을 함께합니다.</span><span>© 2026 Moving Lab</span></footer>
    <nav className="mobile-bottom"><a href="#top"><Sparkles size={18} /><span>날짜 분석</span></a><a href="#how-it-works"><CircleHelp size={18} /><span>분석 기준</span></a></nav>
  </main>
}
