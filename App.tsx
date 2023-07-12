import { useState, useEffect, useRef } from 'react';
import { Text, View, Button, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// https://www.youtube.com/watch?v=HleOwBhfaac
// 1 - Notificação local
// 2 - Noficação via API(Expo notification API, serve para este caso)
// Como enviar os dados por Push API ? Minuto 40. 
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // Apresenta um alerta da notificação.
    shouldPlaySound: true, // Som ao chegar a notificação.
    shouldSetBadge: true,  // Icone em cima do App da quantidade de noticações.
    // Priprity e SONS minuto 8
  
  }),
});

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<Notifications.Notification>({} as Notifications.Notification);
  const notificationReceivedRef = useRef<Notifications.Subscription |  undefined>();// Quando a notificação chegar estou dentro do aplicativo
  const notificationResponseRef = useRef<Notifications.Subscription |  undefined>(); // Quando a notificação for  CLICO. estou fora do APP


  useEffect(() => {
    handleTokenPush()
    
    // Essa parte do effect minuto 31...
    //Dentro do APP
    notificationReceivedRef.current = Notifications.addNotificationReceivedListener(notification => {
      console.log("I: ")
      console.log("Notification received: ",notification)
      console.log("Notification received: ",notification.request.content.title)
      console.log("F: ")
      setNotification(notification);
    });

    // Fora do App
    notificationResponseRef.current = Notifications.addNotificationResponseReceivedListener(notification => {
      console.log("I: ")
      console.log("Notification responde received:",notification);
      console.log("Notification received: ",notification.notification.request.content.title)
      console.log("F: ")
      
    });

    return () => {
      if(!notificationReceivedRef.current) return;
      if(!notificationResponseRef.current) return;
      Notifications.removeNotificationSubscription(notificationReceivedRef.current);
      Notifications.removeNotificationSubscription(notificationResponseRef.current);
    };
    
  }, []);

  const handleTokenPush = async() =>{
    // Pedir premissão ao usuário para enviar notificações
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      alert("Você não tem permissão para receber notificações!")
      return;
    }
    //Pega o token do usuário
    let token = (await Notifications.getExpoPushTokenAsync()).data;
    setExpoPushToken(token)
    // Aqui poderia chamar meu back e enviar para ele meu token, para ficar registrado.
    console.log("1-Token:", token);
  }



  async function handleCallNotification(){
 
    //Enviando notificação local
    await Notifications.scheduleNotificationAsync({
      content: {// minuto 21 o que posso passar para o content, exemplo: imagens,...
        title: "Notification Local",//"Joezer",
        body: "Testando de Notification local",//'Seu nome é Jojo RJ',
        data: { data: 'goes here' },//{ data: 'goes here' },
      },
      trigger: { seconds: 2 },// tempo que a mensagem irá demorar para chegar, aqui TEMPO em segundos.
    });
  }

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
      }}>
      <Text>Your expo push token: {expoPushToken}</Text>
      <ShowLabels notification={notification}/>
      <Button
        title="Chamar Notificações"
        onPress={handleCallNotification}
      />
    </View>
  );
}


type TshowLabelsProps = {
  notification: Notifications.Notification
}
const ShowLabels = ({notification}:TshowLabelsProps ) =>{
  if(!(Object.keys(notification).length > 0)) return null
  return(
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text>Title: { notification.request.content.title} </Text>
      <Text>Body: { notification.request.content.body}</Text>
      <Text>Data: { JSON.stringify(notification.request.content.data)}</Text>
    </View>
  )
}


