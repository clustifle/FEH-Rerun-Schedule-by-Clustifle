export const themes=[
 {id:'fire-emblem-heroes',label:'Fire Emblem Heroes',realm:'base',background:'themes/fire-emblem-heroes/wallpaper.webp',header:'#113f4c',deep:'#062630',panel:'#123e49',field:'#06242d',accent:'#edcf84',line:'#91b3ad',spriteFilter:'none'},
 {id:'midgard',label:'Midgard',realm:'midgard',background:'themes/realms/midgard.webp',header:'#304e78',deep:'#14253c',panel:'#20354c',field:'#101e30',accent:'#ebd49c',line:'#a9b7cd',spriteFilter:'hue-rotate(20deg)'},
 {id:'nifl',label:'Nifl',realm:'nifl',background:'themes/realms/nifl.webp',header:'#397e98',deep:'#153b53',panel:'#163c50',field:'#102937',accent:'#b3edff',line:'#9dcfdf',spriteFilter:'hue-rotate(15deg) saturate(.7)'},
 {id:'muspell',label:'Múspell',realm:'muspell',background:'themes/realms/muspell.webp',header:'#893b25',deep:'#35150f',panel:'#45241b',field:'#24130e',accent:'#ffc375',line:'#d5a37a',spriteFilter:'hue-rotate(165deg)'},
 {id:'hel',label:'Hel',realm:'hel',background:'themes/realms/hel.webp',header:'#314d40',deep:'#101d1a',panel:'#21372e',field:'#111e18',accent:'#b5dcb2',line:'#94b59d',spriteFilter:'hue-rotate(295deg) saturate(.55)'},
 {id:'ljosalfheimr',label:'Ljósálfheimr',realm:'ljosalfheimr',background:'themes/realms/ljosalfheimr.webp',header:'#665584',deep:'#2b2445',panel:'#3c3150',field:'#211c31',accent:'#f5d5fa',line:'#c9b1de',spriteFilter:'hue-rotate(65deg) saturate(.6)'},
 {id:'dokkalfheimr',label:'Dökkálfheimr',realm:'dokkalfheimr',background:'themes/realms/dokkalfheimr.webp',header:'#4e285f',deep:'#1d102c',panel:'#301f42',field:'#180e24',accent:'#e8b7ef',line:'#b293c6',spriteFilter:'hue-rotate(85deg)'},
 {id:'nidavellir',label:'Niðavellir',realm:'nidavellir',background:'themes/realms/nidavellir.webp',header:'#63513a',deep:'#252b30',panel:'#303b43',field:'#1b252c',accent:'#f0ce8a',line:'#afaa91',spriteFilter:'sepia(.55) saturate(.7)'},
 {id:'jotunheimr',label:'Jötunheimr',realm:'jotunheimr',background:'themes/realms/jotunheimr.webp',header:'#6b353c',deep:'#281c25',panel:'#42303b',field:'#251b23',accent:'#f0c1b6',line:'#c3a29c',spriteFilter:'hue-rotate(135deg) saturate(.65)'},
 {id:'vanaheimr',label:'Vanaheimr',realm:'vanaheimr',background:'themes/realms/vanaheimr.webp',header:'#4e6650',deep:'#1b332d',panel:'#2a4136',field:'#182b22',accent:'#ffe1a0',line:'#b7c59c',spriteFilter:'hue-rotate(295deg)'},
 {id:'asgardr',label:'Ásgarðr',realm:'asgardr',background:'themes/realms/asgardr.webp',header:'#5c5179',deep:'#242b4a',panel:'#343a58',field:'#1d243b',accent:'#f5dfaa',line:'#beb9d4',spriteFilter:'hue-rotate(45deg) saturate(.55)'},
] as const;
export type ThemeId=typeof themes[number]['id'];
export function getTheme(id:string){return themes.find(theme=>theme.id===id)||themes[0];}
