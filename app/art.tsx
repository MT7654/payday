import {rewardImage} from '../lib/reward-images';
/** Generated editorial concepts, never a verified merchant listing photograph. */
export function RewardArt({kind='gift',className='',name='',id}:{kind?:string;className?:string;name?:string;id?:string}){
 const image=rewardImage(kind,name,id);
 return <span className={'reward-photo '+className}><img src={image.src} alt={'AI-generated illustrative concept: '+image.subject} loading="lazy" decoding="async" width={768} height={512}/><span className="reward-photo-label" aria-hidden="true">AI concept</span></span>;
}
