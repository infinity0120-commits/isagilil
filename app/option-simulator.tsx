'use client'

import { useState } from 'react'
import { AirVent, Check, CircleDollarSign, Home, Info, Lightbulb, Package, Snowflake, Tv, Truck, Wind, Wrench } from 'lucide-react'
import styles from './option-simulator.module.css'

type PriceRange = { min: number; max: number | null }
type PriceLine = { label: string; range: PriceRange; note?: string }
type Provider = 'official' | 'private'

const zeroRange: PriceRange = { min: 0, max: 0 }
const ladderFloors = [
  { label: '2~5층', min: 12, max: 14 },
  { label: '6~8층', min: 14, max: 16 },
  { label: '9~11층', min: 16, max: 18 },
  { label: '12~14층', min: 18, max: 20 },
  { label: '15~17층', min: 20, max: 23 },
  { label: '18~20층', min: 23, max: 26 },
  { label: '21~24층', min: 28, max: 35 },
  { label: '25층 이상', min: 35, max: null },
]
const tvBase: Record<string, PriceRange> = {
  '55인치 이하': { min: 5, max: 7 },
  '65인치': { min: 6, max: 8 },
  '75인치': { min: 9, max: 12 },
  '85인치': { min: 11, max: 15 },
  '98인치 이상': { min: 15, max: 20 },
}
const acBase: Record<string, Record<Provider, PriceRange>> = {
  '벽걸이 단품': { official: { min: 15, max: 22 }, private: { min: 10, max: 16 } },
  '스탠드 단품': { official: { min: 20, max: 30 }, private: { min: 14, max: 22 } },
  '2in1': { official: { min: 35, max: 55 }, private: { min: 20, max: 35 } },
}
const movingBase: Record<string, PriceRange> = {
  '15평 이하': { min: 80, max: 100 },
  '20평대': { min: 120, max: 140 },
  '30평대 이상': { min: 160, max: 190 },
}

function addRanges(...ranges: PriceRange[]): PriceRange {
  return ranges.reduce<PriceRange>((total, range) => ({
    min: total.min + range.min,
    max: total.max === null || range.max === null ? null : total.max + range.max,
  }), zeroRange)
}

function adjustRange(range: PriceRange, adjustment: number): PriceRange {
  return { min: range.min + adjustment, max: range.max === null ? null : range.max + adjustment }
}

function numberLabel(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, '')
}

function formatRange(range: PriceRange) {
  if (range.max === null) return `${numberLabel(range.min)}만원~ 협의`
  if (range.min === range.max) return `${numberLabel(range.min)}만원`
  return `${numberLabel(range.min)}~${numberLabel(range.max)}만원`
}

function formatTotal(range: PriceRange) {
  if (range.max === null) return `약 ${numberLabel(range.min)}만 ~ 협의`
  return `약 ${numberLabel(range.min)}만 ~ ${numberLabel(range.max)}만원`
}

function formatBreakdown(range: PriceRange) {
  return range.max === null ? `${numberLabel(range.min)}~ 협의` : `${numberLabel(range.min)}~${numberLabel(range.max)}`
}

function SwitchControl({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className={styles.switchControl} htmlFor={id}>
    <span>{label}</span>
    <input id={id} type="checkbox" role="switch" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    <span className={styles.switchTrack} aria-hidden="true"><span /></span>
  </label>
}

function PriceLineRows({ lines }: { lines: PriceLine[] }) {
  return <div className={styles.priceLines}>
    {lines.map((line) => <div className={styles.priceLine} key={line.label}>
      <span>{line.label}{line.note && <small>{line.note}</small>}</span>
      <b>{line.range.min === 0 && line.range.max === 0 && line.note?.includes('포함') ? '포함' : formatRange(line.range)}</b>
    </div>)}
  </div>
}

function OptionCardHeader({ icon, title, description, enabled, onToggle, id }: { icon: React.ReactNode; title: string; description: string; enabled: boolean; onToggle: (checked: boolean) => void; id: string }) {
  return <header className={styles.cardHeader}>
    <span className={styles.cardIcon}>{icon}</span>
    <div className={styles.cardTitle}><h3 id={id.replace('-toggle', '-title')}>{title}</h3><p>{description}</p></div>
    <SwitchControl id={id} label={`${title} 사용`} checked={enabled} onChange={onToggle} />
  </header>
}

export default function OptionSimulator({ homeSize }: { homeSize: string }) {
  const [ladderEnabled, setLadderEnabled] = useState(false)
  const [fromFloor, setFromFloor] = useState(0)
  const [toFloor, setToFloor] = useState(0)
  const [tvEnabled, setTvEnabled] = useState(false)
  const [tvSize, setTvSize] = useState('65인치')
  const [hasBracket, setHasBracket] = useState(true)
  const [tvWall, setTvWall] = useState('일반벽')
  const [tvWireHide, setTvWireHide] = useState(false)
  const [acEnabled, setAcEnabled] = useState(false)
  const [acType, setAcType] = useState('벽걸이 단품')
  const [provider, setProvider] = useState<Provider>('private')
  const [pipeLength, setPipeLength] = useState(5)
  const [gasRefill, setGasRefill] = useState(false)
  const [vacuumWork, setVacuumWork] = useState(false)
  const [outdoorBracket, setOutdoorBracket] = useState(false)
  const [wallDrilling, setWallDrilling] = useState(false)
  const [wardrobe, setWardrobe] = useState(false)
  const [wardrobeJas, setWardrobeJas] = useState(3)
  const [bidet, setBidet] = useState(false)
  const [washTower, setWashTower] = useState(false)
  const [piano, setPiano] = useState(false)

  const ladderAdjustment = homeSize === '15평 이하' ? -2 : homeSize === '30평대 이상' ? 3 : 0
  const ladderRange = ladderEnabled
    ? adjustRange(addRanges(
      { min: ladderFloors[fromFloor].min, max: ladderFloors[fromFloor].max },
      { min: ladderFloors[toFloor].min, max: ladderFloors[toFloor].max },
    ), ladderAdjustment)
    : zeroRange
  const ladderLines: PriceLine[] = ladderEnabled ? [
    { label: `출발지 ${ladderFloors[fromFloor].label}`, range: { min: ladderFloors[fromFloor].min, max: ladderFloors[fromFloor].max } },
    { label: `도착지 ${ladderFloors[toFloor].label}`, range: { min: ladderFloors[toFloor].min, max: ladderFloors[toFloor].max } },
    ...(ladderAdjustment !== 0 ? [{ label: `집 크기 조정 (${homeSize})`, range: { min: ladderAdjustment, max: ladderAdjustment } }] : []),
  ] : []

  const tvLines: PriceLine[] = tvEnabled ? [
    { label: `${tvSize} 기본 설치`, range: tvBase[tvSize] },
    ...(!hasBracket ? [{ label: '브라켓 구매·설치', range: { min: 3, max: 6 } }] : []),
    ...(tvWall === '대리석·아트월·타일' ? [{ label: '대리석·타일 타공', range: { min: 3, max: 5 } }] : []),
    ...(tvWall === '무타공 희망' ? [{ label: '무타공 설치', range: { min: 8, max: 12 } }] : []),
    ...(tvWireHide ? [{ label: '선 숨김·셋톱박스 매립', range: { min: 4, max: 6 } }] : []),
  ] : []
  const tvRange = tvEnabled ? addRanges(...tvLines.map((line) => line.range)) : zeroRange

  const getAcLines = (selectedProvider: Provider): PriceLine[] => {
    if (!acEnabled) return []
    const extraMeters = Math.max(0, pipeLength - 5)
    const pipePerMeter = selectedProvider === 'official' ? { min: 2, max: 2.5 } : { min: 1.5, max: 2 }
    return [
      { label: `${acType} 기본 설치`, range: acBase[acType][selectedProvider] },
      ...(extraMeters > 0 ? [{ label: `배관 추가 ${extraMeters}m`, range: { min: pipePerMeter.min * extraMeters, max: pipePerMeter.max * extraMeters } }] : []),
      ...(gasRefill ? [{ label: '가스 충전', range: { min: 5, max: 10 } }] : []),
      ...(vacuumWork ? [{ label: '진공 작업', range: selectedProvider === 'official' ? zeroRange : { min: 3, max: 5 }, note: selectedProvider === 'official' ? '공식 기본 포함' : undefined }] : []),
      ...(outdoorBracket ? [{ label: '실외기 앵글', range: { min: 5, max: 8 } }] : []),
      ...(wallDrilling ? [{ label: '벽 타공 1개', range: { min: 2, max: 3 } }] : []),
    ]
  }
  const officialAcLines = getAcLines('official')
  const privateAcLines = getAcLines('private')
  const selectedAcLines = provider === 'official' ? officialAcLines : privateAcLines
  const acRange = acEnabled ? addRanges(...selectedAcLines.map((line) => line.range)) : zeroRange
  const extraPipeMeters = Math.max(0, pipeLength - 5)
  const comparisonRows: { label: string; official: PriceRange | null; private: PriceRange | null; officialNote?: string }[] = [
    { label: '기본 설치', official: acBase[acType].official, private: acBase[acType].private },
    { label: '추가 배관', official: extraPipeMeters > 0 ? { min: extraPipeMeters * 2, max: extraPipeMeters * 2.5 } : null, private: extraPipeMeters > 0 ? { min: extraPipeMeters * 1.5, max: extraPipeMeters * 2 } : null },
    { label: '가스 충전', official: gasRefill ? { min: 5, max: 10 } : null, private: gasRefill ? { min: 5, max: 10 } : null },
    { label: '진공 작업', official: vacuumWork ? zeroRange : null, private: vacuumWork ? { min: 3, max: 5 } : null, officialNote: vacuumWork ? '포함' : undefined },
    { label: '실외기 앵글', official: outdoorBracket ? { min: 5, max: 8 } : null, private: outdoorBracket ? { min: 5, max: 8 } : null },
    { label: '벽 타공 1개', official: wallDrilling ? { min: 2, max: 3 } : null, private: wallDrilling ? { min: 2, max: 3 } : null },
  ]

  const otherLines: PriceLine[] = [
    ...(wardrobe ? [{ label: `붙박이장 분해·조립 ${wardrobeJas}자`, range: { min: wardrobeJas * 1.5, max: wardrobeJas * 2 } }] : []),
    ...(bidet ? [{ label: '비데 설치', range: { min: 2, max: 3 } }] : []),
    ...(washTower ? [{ label: '워시타워 분해·결합', range: { min: 3, max: 5 } }] : []),
    ...(piano ? [{ label: '피아노 운반', range: { min: 10, max: 15 } }] : []),
  ]
  const otherRange = addRanges(...otherLines.map((line) => line.range))
  const movingRange = movingBase[homeSize] ?? movingBase['20평대']
  const optionRange = addRanges(ladderRange, tvRange, acRange, otherRange)
  const totalRange = addRanges(movingRange, optionRange)
  const ladderHighFloor = ladderEnabled && (fromFloor >= 4 || toFloor >= 4)

  return <div className={styles.calculator}>
    <div className={styles.intro}>
      <span className={styles.eyebrow}>MOVE SMARTER · 추가 비용 미리보기</span>
      <h2>추가 옵션 비용 시뮬레이터</h2>
      <p>필요한 항목을 선택하면 예상 범위와 총액이 바로 업데이트돼요.</p>
    </div>

    <section className={styles.optionCard} aria-labelledby="ladder-title">
      <OptionCardHeader icon={<Truck aria-hidden="true" />} title="사다리차" description="5톤 기준 · 편도 비용" enabled={ladderEnabled} onToggle={setLadderEnabled} id="ladder-toggle" />
      {ladderEnabled && <div className={styles.cardBody}>
        <div className={styles.fieldGrid}>
          <label className={styles.field} htmlFor="from-floor"><span>출발지 층수</span><select id="from-floor" value={fromFloor} onChange={(event) => setFromFloor(Number(event.target.value))}>{ladderFloors.map((floor, index) => <option key={floor.label} value={index}>{floor.label}</option>)}</select></label>
          <label className={styles.field} htmlFor="to-floor"><span>도착지 층수</span><select id="to-floor" value={toFloor} onChange={(event) => setToFloor(Number(event.target.value))}>{ladderFloors.map((floor, index) => <option key={floor.label} value={index}>{floor.label}</option>)}</select></label>
        </div>
        <PriceLineRows lines={ladderLines} />
        <div className={styles.subtotal}><span>출발지 + 도착지{ladderAdjustment !== 0 ? ' + 집 크기 조정' : ''} = 총 사다리 비용</span><b>{formatRange(ladderRange)}</b></div>
        {ladderHighFloor && <div className={styles.infoCallout}><Info aria-hidden="true" /><p>15층 이상은 사다리차 편도 20만원+ vs 아파트 엘리베이터 사용료 10~15만원, 엘리베이터가 더 저렴할 수 있어요</p></div>}
      </div>}
    </section>

    <section className={styles.optionCard} aria-labelledby="tv-title">
      <OptionCardHeader icon={<Tv aria-hidden="true" />} title="벽걸이 TV 설치" description="TV 크기와 벽 재질에 따라 달라져요" enabled={tvEnabled} onToggle={setTvEnabled} id="tv-toggle" />
      {tvEnabled && <div className={styles.cardBody}>
        <div className={styles.fieldGrid}>
          <label className={styles.field} htmlFor="tv-size"><span>TV 인치</span><select id="tv-size" value={tvSize} onChange={(event) => setTvSize(event.target.value)}>{Object.keys(tvBase).map((option) => <option key={option}>{option}</option>)}</select></label>
          <fieldset className={styles.choiceField}><legend>브라켓 보유 여부</legend><div className={styles.segmented}><label><input type="radio" name="tv-bracket" checked={hasBracket} onChange={() => setHasBracket(true)} /><span>보유</span></label><label><input type="radio" name="tv-bracket" checked={!hasBracket} onChange={() => setHasBracket(false)} /><span>없음</span></label></div></fieldset>
        </div>
        <fieldset className={styles.choiceField}>
          <legend>벽 재질</legend>
          <div className={styles.wallChoices}>{['일반벽', '대리석·아트월·타일', '무타공 희망'].map((option) => <label className={styles.wallChoice} key={option}><input type="radio" name="tv-wall" checked={tvWall === option} onChange={() => setTvWall(option)} /><span>{option}</span></label>)}</div>
        </fieldset>
        <label className={styles.checkOption}><input type="checkbox" checked={tvWireHide} onChange={(event) => setTvWireHide(event.target.checked)} /><span className={styles.checkMark} aria-hidden="true"><Check /></span><span>선 숨김·셋톱박스 매립</span><b>+4~6만원</b></label>
        <PriceLineRows lines={tvLines} />
        <div className={styles.subtotal}><span>TV 설치 예상 비용</span><b>{formatRange(tvRange)}</b></div>
      </div>}
    </section>

    <section className={styles.optionCard} aria-labelledby="air-title">
      <OptionCardHeader icon={<AirVent aria-hidden="true" />} title="에어컨 이전 설치" description="공식 브랜드와 사설 전문기사 비교" enabled={acEnabled} onToggle={setAcEnabled} id="ac-toggle" />
      {acEnabled && <div className={styles.cardBody}>
        <label className={styles.field} htmlFor="ac-type"><span>에어컨 종류</span><select id="ac-type" value={acType} onChange={(event) => setAcType(event.target.value)}>{Object.keys(acBase).map((option) => <option key={option}>{option}</option>)}</select></label>
        <fieldset className={styles.choiceField}>
          <legend>견적 방식 선택</legend>
          <div className={styles.providerChoices}>
            <label className={provider === 'official' ? styles.providerSelected : ''}><input type="radio" name="ac-provider" checked={provider === 'official'} onChange={() => setProvider('official')} /><span><b>공식 브랜드</b><small>정찰제 · 브랜드 A/S</small></span></label>
            <label className={provider === 'private' ? styles.providerSelected : ''}><input type="radio" name="ac-provider" checked={provider === 'private'} onChange={() => setProvider('private')} /><span><b>사설 전문기사</b><small>합리적인 비용 비교</small></span></label>
          </div>
        </fieldset>
        <div className={styles.sliderField}><div><label htmlFor="pipe-length">배관 길이</label><output htmlFor="pipe-length">{pipeLength}m</output></div><input id="pipe-length" type="range" min="3" max="10" step="1" value={pipeLength} onChange={(event) => setPipeLength(Number(event.target.value))} /><div className={styles.rangeEnds}><span>3m</span><span>기본 5m 포함</span><span>10m</span></div></div>
        <div className={styles.checkboxGrid}>
          <label className={styles.checkOption}><input type="checkbox" checked={gasRefill} onChange={(event) => setGasRefill(event.target.checked)} /><span className={styles.checkMark} aria-hidden="true"><Check /></span><span>가스 충전</span><b>+5~10만원</b></label>
          <label className={styles.checkOption}><input type="checkbox" checked={vacuumWork} onChange={(event) => setVacuumWork(event.target.checked)} /><span className={styles.checkMark} aria-hidden="true"><Check /></span><span>진공 작업</span><b>{provider === 'official' ? '공식 포함' : '+3~5만원'}</b></label>
          <label className={styles.checkOption}><input type="checkbox" checked={outdoorBracket} onChange={(event) => setOutdoorBracket(event.target.checked)} /><span className={styles.checkMark} aria-hidden="true"><Check /></span><span>실외기 앵글</span><b>+5~8만원</b></label>
          <label className={styles.checkOption}><input type="checkbox" checked={wallDrilling} onChange={(event) => setWallDrilling(event.target.checked)} /><span className={styles.checkMark} aria-hidden="true"><Check /></span><span>벽 타공 1개</span><b>+2~3만원</b></label>
        </div>
        <div className={styles.comparisonWrap}>
          <h4><Wind aria-hidden="true" /> 공식 브랜드 vs 사설 전문기사</h4>
          <div className={styles.tableScroll}><table className={styles.comparisonTable}><thead><tr><th scope="col">항목</th><th scope="col">공식 브랜드</th><th scope="col">사설 기사</th></tr></thead><tbody>
            {comparisonRows.map((row) => <tr key={row.label}><th scope="row">{row.label}</th><td className={provider === 'official' ? styles.selectedCell : ''}>{row.official === null ? '—' : row.officialNote ?? formatRange(row.official)}</td><td className={provider === 'private' ? styles.selectedCell : ''}>{row.private === null ? '—' : formatRange(row.private)}</td></tr>)}
            <tr className={styles.tableTotal}><th scope="row">선택 조건 합계</th><td className={provider === 'official' ? styles.selectedCell : ''}>{formatRange(addRanges(...officialAcLines.map((line) => line.range)))}</td><td className={provider === 'private' ? styles.selectedCell : ''}>{formatRange(addRanges(...privateAcLines.map((line) => line.range)))}</td></tr>
          </tbody></table></div>
        </div>
        <PriceLineRows lines={selectedAcLines} />
        <div className={styles.subtotal}><span>{provider === 'official' ? '공식 브랜드' : '사설 전문기사'} 예상 비용</span><b>{formatRange(acRange)}</b></div>
        <div className={styles.tipCallout}><Lightbulb aria-hidden="true" /><p><strong>현직자 팁</strong> 이사 전 철거할 때 &quot;펌프다운(가스 모으기) 해주세요&quot;라고 꼭 말하세요. 가스가 멀쩡한데 완충비 10만원 요구하면 게이지 확인부터 요청하세요.</p></div>
      </div>}
    </section>

    <section className={styles.optionCard} aria-labelledby="other-title">
      <header className={styles.simpleHeader}><span className={styles.cardIcon}><Package aria-hidden="true" /></span><div className={styles.cardTitle}><h3 id="other-title">기타 옵션</h3><p>필요한 서비스만 골라 담으세요</p></div></header>
      <div className={styles.cardBody}>
        <label className={styles.checkOption}><input type="checkbox" checked={wardrobe} onChange={(event) => setWardrobe(event.target.checked)} /><span className={styles.checkMark} aria-hidden="true"><Check /></span><span>붙박이장 분해·조립</span><b>1자당 1.5~2만원</b></label>
        {wardrobe && <div className={styles.sliderField}><div><label htmlFor="wardrobe-jas">붙박이장 길이</label><output htmlFor="wardrobe-jas">{wardrobeJas}자</output></div><input id="wardrobe-jas" type="range" min="1" max="10" step="1" value={wardrobeJas} onChange={(event) => setWardrobeJas(Number(event.target.value))} /><div className={styles.rangeEnds}><span>1자</span><span>10자</span></div></div>}
        <div className={styles.checkboxGrid}>
          <label className={styles.checkOption}><input type="checkbox" checked={bidet} onChange={(event) => setBidet(event.target.checked)} /><span className={styles.checkMark} aria-hidden="true"><Check /></span><span>비데 설치</span><b>2~3만원</b></label>
          <label className={styles.checkOption}><input type="checkbox" checked={washTower} onChange={(event) => setWashTower(event.target.checked)} /><span className={styles.checkMark} aria-hidden="true"><Check /></span><span>워시타워 분해·결합</span><b>3~5만원</b></label>
          <label className={styles.checkOption}><input type="checkbox" checked={piano} onChange={(event) => setPiano(event.target.checked)} /><span className={styles.checkMark} aria-hidden="true"><Check /></span><span>피아노 운반</span><b>10~15만원</b></label>
        </div>
        {otherLines.length > 0 && <><PriceLineRows lines={otherLines} /><div className={styles.subtotal}><span>기타 옵션 합계</span><b>{formatRange(otherRange)}</b></div></>}
      </div>
    </section>

    <aside className={styles.stickySummary} aria-label="총 예상 비용 요약">
      <div className={styles.summaryTop}><span className={styles.summaryIcon}><CircleDollarSign aria-hidden="true" /></span><div><span className={styles.summaryLabel}>총 예상 비용 범위</span><strong aria-live="polite">총 예상: {formatTotal(totalRange)}</strong></div></div>
      <p className={styles.summaryEquation}>기본이사 {formatBreakdown(movingRange)} + 추가옵션 {optionRange.min === 0 && optionRange.max === 0 ? '선택 없음' : `${formatBreakdown(optionRange)}${optionRange.max === null ? '' : '만원'}`}</p>
      <div className={styles.summaryRows}>
        <span><Home aria-hidden="true" /> 기본이사 <b>{formatRange(movingRange)}</b></span>
        <span><Truck aria-hidden="true" /> 사다리차 <b>{formatRange(ladderRange)}</b></span>
        <span><Tv aria-hidden="true" /> TV <b>{formatRange(tvRange)}</b></span>
        <span><Snowflake aria-hidden="true" /> 에어컨 <b>{formatRange(acRange)}</b></span>
        <span><Wrench aria-hidden="true" /> 기타 <b>{formatRange(otherRange)}</b></span>
      </div>
      <small className={styles.disclaimer}>평균 시세 기준 예상치이며, 짐 양과 현장 상황에 따라 실제 견적은 달라질 수 있습니다.</small>
    </aside>
  </div>
}
