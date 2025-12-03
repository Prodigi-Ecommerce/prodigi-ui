import { sectionTitleClass } from '../../constants'

interface MetadataItemProps {
  label: string
  value: string
  mono?: boolean
}

export const MetadataItem = ({ label, value, mono }: MetadataItemProps) => (
  <div className="space-y-1">
    <p className={sectionTitleClass}>{label}</p>
    <p
      className={mono ? 'font-mono text-sm break-all' : 'text-sm text-foreground'}
    >
      {value}
    </p>
  </div>
)
