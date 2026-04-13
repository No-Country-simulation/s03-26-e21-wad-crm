import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WHATSAPP_FILTER_OPTIONS } from './constants'

interface WhatsAppOptionsProps {
  isMobile: boolean
}

export function WhatsAppOptions({ isMobile }: WhatsAppOptionsProps) {
  const renderOptions = () => (
    <div className="flex flex-col gap-1 p-3">
      {WHATSAPP_FILTER_OPTIONS.map((option) => (
        <Button
          key={option.id}
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
        >
          {option.label}
        </Button>
      ))}
    </div>
  )

  if (isMobile) {
    return renderOptions()
  }

  return (
    <ScrollArea className="h-[calc(100vh-280px)]">
      {renderOptions()}
    </ScrollArea>
  )
}

interface WhatsAppTabsProps {
  isMobile: boolean
  conversationsContent: React.ReactNode
  optionsContent: React.ReactNode
}

export function WhatsAppTabs({ isMobile, conversationsContent, optionsContent }: WhatsAppTabsProps) {
  if (isMobile) {
    return <>{conversationsContent}</>
  }

  return (
    <Tabs defaultValue="conversations" className="h-full flex flex-col flex-1 min-h-0">
      <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-3 h-10">
        <TabsTrigger value="conversations" className="text-xs">
          Conversaciones
        </TabsTrigger>
        <TabsTrigger value="options" className="text-xs">
          Opciones
        </TabsTrigger>
      </TabsList>

      <TabsContent value="conversations" className="flex-1 m-0">
        {conversationsContent}
      </TabsContent>

      <TabsContent value="options" className="flex-1 m-0">
        {optionsContent}
      </TabsContent>
    </Tabs>
  )
}
