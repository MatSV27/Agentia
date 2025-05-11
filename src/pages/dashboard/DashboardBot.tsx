import { Card, CardContent } from "@/components/ui/card";
import ChatModule from "@/components/modules/ChatModule";

const DashboardBot = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Chat IA - Asistente Personal</h2>
      
      <Card className="border-green-100 shadow-sm">
        <CardContent className="p-0">
          <ChatModule />
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardBot; 