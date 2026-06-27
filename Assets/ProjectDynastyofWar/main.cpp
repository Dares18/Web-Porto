#include <iostream>
#include <vector>
#include <ctime>
#include <string>
using namespace std;

void PlayerAction(int playeractionsel);
void CompAction(int compactionsel);

//Class Character
class Character{
    private :
        string CharType;
        int MaxHealth = 10;
        int BaseAttack = 3;
        int BaseDefense = 2;
        int HP;
        int ATK;
        int DEF;
    public :

        void setCharType(string setCharType){
            CharType = setCharType;
        }
        void setHP(int setHP){
            HP = setHP;
        }
        void setATK(int setATK){
            ATK = setATK;
        }
        void setDEF(int setDEF){
            DEF = setDEF;
        }


        string getCharType(){
            return CharType;
        }

        int getMaxHealth(){
            return MaxHealth;
        }

        int getBaseAttack(){
            return BaseAttack;
        }
        int getBaseDefense(){
            return BaseDefense;
        }
        int getHP(){
            return HP;
        }
        int getATK(){
            return ATK;
        }
        int getDEF(){
            return DEF;
        }
};

//Deklarasi pemain
Character Player;
Character Comp;

//===========================================================================PLAYER===========================================================================
void PlayerAction(int playeractionsel){
    switch (playeractionsel){
    case 1 :{
        cout << "You Attacks !" << endl;
        int OpponentHP = Comp.getHP()-Player.getATK();
        Comp.setHP(OpponentHP);
        cout << "Opponent HP : "<< Comp.getHP() << endl;
        break;
    }
    case 3 : {
        int Randomizer = rand() % 3 + 1;  //Random ATK Up dari 1-3
        int AtkUp = Player.getATK();
        AtkUp  = AtkUp + Randomizer;
        Player.setATK(AtkUp);
        cout << "Attack Up !, Attack bertambah +" << Randomizer << endl;
        cout << "ATK Kamu sekarang : " << Player.getATK() << endl;
        break;
    }
    case 4 :{
        int Randomizer = rand() % 3 + 1;  //Random ATK Up dari 1-3
        int DefUp = Player.getDEF();
        DefUp  = DefUp + Randomizer;
        Player.setDEF(DefUp);
        cout << "Defense Up !, Defense bertambah +" << Randomizer << endl;
        cout << "DEF Kamu sekarang : " << Player.getDEF() << endl;
        break;
    }
    case 5 :{
        int HPMissing = Player.getMaxHealth()-Player.getHP() + 1;
        int Randomizer = rand() % HPMissing + 1;// Random Heal Up dari 1 - HP Missing
        int HealAmmount = Player.getHP();
        HealAmmount  = HealAmmount + Randomizer;
        Player.setHP(HealAmmount);
        cout << "Heals !, HP bertambah +" << Randomizer << endl;
        cout << "HP Kamu sekarang : " << Player.getHP() << endl;
        break;
    }
    default:
        break;
    }
}
//===========================================================================PLAYER===========================================================================

//===========================================================================COMPUTER===========================================================================
void CompAction(int compactionsel){
    switch (compactionsel){
    case 1:{
    //Attack
        cout << "Computer Attacks !" << endl;
        int OpponentHP = Player.getHP()-Comp.getATK();
        Player.setHP(OpponentHP);
        cout << "Your HP : "<< Player.getHP() << endl;
        break;
    }
    case 3:{
    //Attack Up
        int Randomizer = rand() % 3 + 1;  //Random ATK Up dari 1-3
        int AtkUp = Comp.getATK();
        AtkUp  = AtkUp + Randomizer;
        Comp.setATK(AtkUp);
        cout << "Computer Attack Up !, Attack bertambah +" << Randomizer << endl;
        cout << "ATK Computer sekarang : " << Comp.getATK() << endl;
        break;
    }
    case 4:{
    //Def Up
        int Randomizer = rand() % 3 + 1;  //Random DEF Up dari 1-3
        int DefUp = Comp.getDEF();
        DefUp  = DefUp + Randomizer;
        Comp.setDEF(DefUp);
        cout << "Computer Defense Up !, Defense bertambah +" << Randomizer << endl;
        cout << "Defense Computer sekarang : " << Comp.getATK() << endl;
        break;
    }
    case 5:{
    //Heal
        int HPMissing = Comp.getMaxHealth()-Comp.getHP() + 1;
        int Randomizer = rand() % HPMissing + 1;// Random Heal Up dari 1 - HP Missing
        int HealAmmount = Comp.getHP();
        HealAmmount  = HealAmmount + Randomizer;
        Comp.setHP(HealAmmount);
        cout << "Computer Heals !, HP bertambah +" << Randomizer << endl;
        cout << "HP Computer sekarang : " << Comp.getHP() << endl;
        break;
    }
    default:{
        break;
    }
    }
}
//===========================================================================COMPUTER===========================================================================


int main(){

    int menu = 0;
    int charopt = 0;
    srand(static_cast<unsigned int>(time(0)));

    while (menu != 2){
        //Menu
        cout << "|==================================================|" << endl;
        cout << "|==========       Dynasty of War         ==========|" << endl;
        cout << "|==================================================|" << endl;
        cout << "|= Pilih angka (1) untuk Memulai (2) untuk keluar =|" << endl;
        cout << "|======              1. Mulai                ======|" << endl;
        cout << "|=====               2. Keluar                =====|" << endl;
        cout << "|==================================================|" << endl;
        cout << "Pilihan : "; cin >> menu;
        cout << endl;

        switch (menu){
        case 1:{
            // Character Class :
            vector <string> chartype{"Ogre","Knight","Mage","Swordsman"};
            cout << "=================" << endl;
            cout << "Pilih Karakter (angka 1, 2, 3, 4):" << endl;
            cout << "1. Ogre" << endl;
            cout << "2. Knight" << endl;
            cout << "3. Mage" << endl;
            cout << "4. Swordsman" << endl;
            cout << "=================" << endl;
            cout << "Pilih Karakter : "; cin >> charopt;


            string kartype;
            auto kar = chartype.begin()+(charopt-1);
            kartype = *kar;

            chartype.erase(chartype.begin()+(charopt-1));

            //Character Player
            Player.setCharType(kartype);
            Player.setHP(Player.getMaxHealth());
            Player.setATK(Player.getBaseAttack());
            Player.setDEF(Player.getBaseDefense());


            //Comp memilih chartype
            charopt = rand()%3 + 1;
            kar = chartype.begin()+(charopt-1);
            kartype = *kar;

            //Character Compter
            Comp.setCharType(kartype);
            Comp.setHP(Comp.getMaxHealth());
            Comp.setATK(Comp.getBaseAttack());
            Comp.setDEF(Comp.getBaseDefense());



            //Repeat while either players have hp > 0
            while (Player.getHP() > 0 && Comp.getHP() > 0){
                int playeractionsel;
                int compactionsel;

                cout << endl;
                cout << "=====PLAYER STATS=====" << endl;
                cout << "CharType : " << Player.getCharType() << endl;
                cout << "HP : " << Player.getHP() << endl;
                cout << "ATK : " << Player.getATK() << endl;
                cout << "DEF : " << Player.getDEF() << endl;
                cout << "======================" << endl;

                cout << endl;
                cout << "=====COMP STATS=====" << endl;
                cout << "CharType : " << Comp.getCharType() << endl;
                cout << "HP : " << Comp.getHP() << endl;
                cout << "ATK : " << Comp.getATK() << endl;
                cout << "DEF : " << Comp.getDEF() << endl;
                cout << "====================" << endl;
                cout << endl;
                cout << "=================" << endl;
                cout << "ACTION" << endl;
                cout << "1. Serang" << endl;
                cout << "2. Defend" << endl;
                cout << "3. Atk Up" << endl;
                cout << "4. Defense Up" << endl;
                cout << "5. Heal" << endl;
                cout << "=================" << endl;
                cout << "Pilih action : ";
                //Player action :
                cin >> playeractionsel;
                //Comp action :
                compactionsel = rand() % 5 + 1;

                //Player Action
                switch (playeractionsel){
                //Player Attacks
                case 1:{
                    //Comp Action
                    switch (compactionsel){
                    //Comp Attacks
                    case 1:{
                        //--PLAYER--
                        PlayerAction(playeractionsel);
                        cout<<endl;
                        if(Comp.getHP() <= 0 ){
                            break;
                        }
                        //--COMP--
                        CompAction(compactionsel);
                        cout<<endl;
                        break;
                    }
                    //Comp Defends
                    case 2:{
                        cout << "Computer Defended your attack !" << endl;
                        //Defend : ATK dikurangi DEF lawan
                        if(Player.getATK() <= Comp.getDEF()){
                            cout << "Computer has more defense than your attack ! " << endl;
                            break;
                        }else{
                        int OpponentHP = Comp.getHP()-(Player.getATK()-Comp.getDEF());
                        Comp.setHP(OpponentHP);
                        cout << "Opponent HP : "<< Comp.getHP() << endl;
                        cout<<endl;
                        break;
                        }
                    }
                    //Comp Atk Up
                    case 3:{
                        //--PLAYER--
                        PlayerAction(playeractionsel);
                        cout<<endl;
                        if(Comp.getHP() <= 0 ){
                            break;
                        }
                        //--COMP--
                        CompAction(compactionsel);
                        cout<<endl;
                        break;
                    }
                    //Comp Def Up
                    case 4:{
                        //--PLAYER--
                        PlayerAction(playeractionsel);
                        cout<<endl;
                        if(Comp.getHP() <= 0 ){
                            break;
                        }
                         //--COMP--
                        CompAction(compactionsel);
                        cout<<endl;
                        break;
                    }
                    //Comp Heals
                    case 5:{
                        //--PLAYER--
                        PlayerAction(playeractionsel);
                        cout<<endl;
                        if(Comp.getHP() <= 0 ){
                            break;
                        }
                         //--COMP--
                        CompAction(compactionsel);
                        cout<<endl;
                        break;
                    }
                    default:{
                        break;
                    }
                    }
                    break;
                }
                //Player Defends
                case 2:{
                    //Comp Action
                    switch (compactionsel){
                    //Comp Attacks
                    case 1:{
                        cout << "You Defended computer attack !" << endl;
                        if(Comp.getATK() <= Player.getDEF()){
                            cout << "You have has more defense than computer attack ! " << endl;
                            break;
                        }else{
                        //Defend : ATK dikurangi DEF lawan
                        int OpponentHP = Player.getHP()-(Comp.getATK()-Player.getDEF());
                        Player.setHP(OpponentHP);
                        cout << "Your HP : "<< Player.getHP() << endl;
                        cout<<endl;
                        break;
                        }
                    }
                    //Comp Defends
                    case 2:{
                        //Ini 2 2 nya milih Defend
                        cout << "You and Computer defends!, nothing happens.." << endl;
                        cout<<endl;
                        break;
                    }
                    //Comp Atk Up
                    case 3:{
                        //--PLAYER--
                        cout << "You Defends !" << endl;
                        cout<<endl;
                        //--COMP--
                        CompAction(compactionsel);
                        cout<<endl;
                        break;
                    }
                    //Comp Def Up
                    case 4:{
                        //--PLAYER--
                        cout << "You Defends !" << endl;
                        cout<<endl;
                         //--COMP--
                        CompAction(compactionsel);
                        cout<<endl;
                        break;
                    }
                    //Comp Heals
                    case 5:{
                        //--PLAYER--
                        cout << "You Defends !" << endl;
                        cout<<endl;
                         //--COMP--
                        CompAction(compactionsel);
                        cout<<endl;
                        break;
                    }
                    default:{
                        break;
                    }
                    }
                    break;
                }
                //Player Attack Up
                case 3:{
                    //Comp Action
                    switch (compactionsel){
                    //Comp Attacks
                    case 1:{
                        //--PLAYER--
                        PlayerAction(playeractionsel);
                        cout<<endl;
                        //--COMP--
                        CompAction(compactionsel);
                        cout<<endl;
                        break;
                    }
                    //Comp Defends
                    case 2:{
                        //--PLAYER--
                        PlayerAction(playeractionsel);
                        cout<<endl;
                        cout << "Computer Defends !" << endl;
                        break;
                    }
                    //Comp Atk Up
                    case 3:{
                        //--PLAYER--
                        PlayerAction(playeractionsel);
                        cout<<endl;
                        //--COMP--
                        CompAction(compactionsel);
                        cout<<endl;
                        break;
                    }
                    //Comp Def Up
                    case 4:{
                        //--PLAYER--
                        PlayerAction(playeractionsel);
                        cout<<endl;
                         //--COMP--
                        CompAction(compactionsel);
                        cout<<endl;
                        break;
                    }
                    //Comp Heals
                    case 5:{
                        //--PLAYER--
                        PlayerAction(playeractionsel);
                        cout<<endl;
                         //--COMP--
                        CompAction(compactionsel);
                        cout<<endl;
                        break;
                    }
                    default:{
                        break;
                    }
                    }
                    break;
                }
                //Player Defense Up
                case 4:{
                    //Comp Action
                    switch (compactionsel){
                    //Comp Attacks
                    case 1:{
                        //--PLAYER--
                        PlayerAction(playeractionsel);
                        cout<<endl;
                        //--COMP--
                        CompAction(compactionsel);
                        cout<<endl;
                        break;
                    }
                    //Comp Defends
                    case 2:{
                        //--PLAYER--
                        PlayerAction(playeractionsel);
                        cout<<endl;
                        cout << "Computer Defends !" << endl;
                        break;
                    }
                    //Comp Atk Up
                    case 3:{
                        //--PLAYER--
                        PlayerAction(playeractionsel);
                        cout<<endl;
                        //--COMP--
                        CompAction(compactionsel);
                        cout<<endl;
                        break;
                    }
                    //Comp Def Up
                    case 4:{
                        //--PLAYER--
                        PlayerAction(playeractionsel);
                        cout<<endl;
                         //--COMP--
                        CompAction(compactionsel);
                        cout<<endl;
                        break;
                    }
                    //Comp Heals
                    case 5:{
                        //--PLAYER--
                        PlayerAction(playeractionsel);
                        cout<<endl;
                         //--COMP--
                        CompAction(compactionsel);
                        cout<<endl;
                        break;
                    }
                    default:{
                        break;
                    }
                    }
                    break;
                }
                //Player Heals
                case 5:{
                    //Comp Action
                    switch (compactionsel){
                    //Comp Attacks
                    case 1:{
                        //--PLAYER--
                        PlayerAction(playeractionsel);
                        cout<<endl;
                        //--COMP--
                        CompAction(compactionsel);
                        cout<<endl;
                        break;
                    }
                    //Comp Defends
                    case 2:{
                        PlayerAction(playeractionsel);
                        cout<<endl;
                        cout << "Computer Defends !" << endl;
                        break;
                    }
                    //Comp Atk Up
                    case 3:{
                        //--PLAYER--
                        PlayerAction(playeractionsel);
                        cout<<endl;
                        //--COMP--
                        CompAction(compactionsel);
                        cout<<endl;
                        break;
                    }
                    //Comp Def Up
                    case 4:{
                        //--PLAYER--
                        PlayerAction(playeractionsel);
                        cout<<endl;
                         //--COMP--
                        CompAction(compactionsel);
                        cout<<endl;
                        break;
                    }
                    //Comp Heals
                    case 5:{
                        //--PLAYER--
                        PlayerAction(playeractionsel);
                        cout<<endl;
                         //--COMP--
                        CompAction(compactionsel);
                        cout<<endl;
                        break;
                    }
                    default:{
                        break;
                    }
                    }
                    break;
                }
                default:{
                    break;
                }
                }
            }
            if(Player.getHP() > Comp.getHP()){
                    //Kalah
                    cout << "Kamu Menang !" <<endl;
                }else{
                    //Menang
                    cout << "Kamu Kalah !" <<endl;
                }


            break;
        }
        case 2:{
            cout << "=================" << endl;
            cout << "Thankyou for playing !" << endl;
            cout << "=================" << endl;
            break;
        }
        default:
            break;
        }
    }
}
